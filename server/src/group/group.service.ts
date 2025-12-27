import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { Group, Card } from '@prisma/client';
import { unlink } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

type GroupWithCardsAndChildren = Group & { 
  cards: Card[]; 
  children?: GroupWithCardsAndChildren[];
};

export interface UpdateGroupPublicDto {
  isPublic?: boolean;
  description?: string;
  language?: string;
  tags?: string[];
}

export interface ShareGroupDto {
  recipientEmail: string;
}

@Injectable()
export class GroupService {
  private readonly logger = new Logger(GroupService.name);
  private notificationService: any = null;

  constructor(private readonly databaseService: DatabaseService) {}

  // Setter for notification service (to avoid circular dependency)
  setNotificationService(service: any) {
    this.notificationService = service;
  }

  async createGroup(
    createGroupDto: CreateGroupDto,
    userId: number,
  ): Promise<{ success: boolean; data?: Group; message?: string }> {
    try {
      const group = await this.databaseService.group.create({
        data: {
          name: createGroupDto.name,
          userId,
          parentId: createGroupDto.parentId || null,
        },
      });

      return { success: true, data: group };
    } catch (err: unknown) {
      let msg = 'Failed to create group';
      if (err instanceof Error) {
        msg = err.message;
        this.logger.error(`Create group error: ${err.message}`, err.stack);
      } else {
        this.logger.error(
          'Create group error (non-Error value)',
          JSON.stringify(err),
        );
      }
      return { success: false, message: msg };
    }
  }

  async getAllGroups(userId: number): Promise<GroupWithCardsAndChildren[]> {
    // Get all groups for user with cards and children recursively
    const groups = await this.databaseService.group.findMany({
      where: { 
        userId,
        parentId: null, // Only top-level groups
      },
      include: {
        cards: true,
        children: {
          include: {
            cards: true,
            children: {
              include: {
                cards: true,
                children: {
                  include: {
                    cards: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
    return groups;
  }
  async updateGroup(
    groupId: string,
    groupName: string,
  ): Promise<{ success: boolean; data?: Group; message?: string }> {
    try {
      const group = await this.databaseService.group.update({
        where: { id: groupId },
        data: { name: groupName },
      });
      return { success: true, data: group };
    } catch (err: unknown) {
      let msg = 'Failed to update group';
      if (err instanceof Error) {
        msg = err.message;
        this.logger.error(`Update group error: ${err.message}`, err.stack);
      } else {
        this.logger.error(
          'Update group error (non-Error value)',
          JSON.stringify(err),
        );
      }
      return { success: false, message: msg };
    }
  }

  async deleteGroup(
    groupId: string,
  ): Promise<{ success: boolean; message?: string }> {
    try {
      // First, get all cards in this group and its children to delete their media files
      const allGroupIds = await this.getAllChildGroupIds(groupId);
      allGroupIds.push(groupId);
      
      const cards = await this.databaseService.card.findMany({
        where: { groupId: { in: allGroupIds } },
        select: { questionMediaUrl: true, answerMediaUrl: true },
      });
      
      // Delete the group (cascade will delete cards)
      await this.databaseService.group.delete({ where: { id: groupId } });
      
      // Delete associated media files
      for (const card of cards) {
        await this.deleteMediaFiles(card.questionMediaUrl);
        await this.deleteMediaFiles(card.answerMediaUrl);
      }
      
      return { success: true };
    } catch (err: unknown) {
      let msg = 'Failed to delete group';
      if (err instanceof Error) {
        msg = err.message;
        this.logger.error(`Delete group error: ${err.message}`, err.stack);
      } else {
        this.logger.error(
          'Delete group error (non-Error value)',
          JSON.stringify(err),
        );
      }
      return { success: false, message: msg };
    }
  }

  private async getAllChildGroupIds(groupId: string): Promise<string[]> {
    const children = await this.databaseService.group.findMany({
      where: { parentId: groupId },
      select: { id: true },
    });
    
    const childIds: string[] = [];
    for (const child of children) {
      childIds.push(child.id);
      const grandChildren = await this.getAllChildGroupIds(child.id);
      childIds.push(...grandChildren);
    }
    return childIds;
  }

  private async deleteMediaFiles(mediaUrl: string | null): Promise<void> {
    if (!mediaUrl) return;
    
    // Handle comma-separated URLs (multiple screenshots)
    const urls = mediaUrl.split(',');
    
    for (const url of urls) {
      const trimmedUrl = url.trim();
      if (trimmedUrl.startsWith('/uploads/')) {
        const filename = trimmedUrl.replace('/uploads/', '');
        const filePath = join(process.cwd(), 'uploads', filename);
        
        try {
          if (existsSync(filePath)) {
            await unlink(filePath);
            this.logger.log(`Deleted media file: ${filename}`);
          }
        } catch (err) {
          this.logger.error(`Failed to delete file ${filename}: ${err}`);
        }
      }
    }
  }

  async moveGroup(
    groupId: string,
    newParentId: string | null,
  ): Promise<{ success: boolean; data?: Group; message?: string }> {
    try {
      // Prevent moving a group into itself or its descendants
      if (newParentId) {
        let currentParent = newParentId;
        while (currentParent) {
          if (currentParent === groupId) {
            return { success: false, message: 'Cannot move a group into itself or its descendants' };
          }
          const parent = await this.databaseService.group.findUnique({
            where: { id: currentParent },
            select: { parentId: true },
          });
          currentParent = parent?.parentId || '';
        }
      }

      const group = await this.databaseService.group.update({
        where: { id: groupId },
        data: { parentId: newParentId },
      });
      return { success: true, data: group };
    } catch (err: unknown) {
      let msg = 'Failed to move group';
      if (err instanceof Error) {
        msg = err.message;
        this.logger.error(`Move group error: ${err.message}`, err.stack);
      }
      return { success: false, message: msg };
    }
  }

  async verifyGroupOwnership(
    groupId: string,
    userId: number,
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const group = await this.databaseService.group.findUnique({
        where: { id: groupId },
        select: { userId: true },
      });

      if (!group) {
        return { success: false, message: 'Group not found' };
      }

      if (group.userId !== userId) {
        return {
          success: false,
          message: 'Access denied: You do not own this group',
        };
      }

      return { success: true };
    } catch (err: unknown) {
      this.logger.error('Group ownership verification error', err);
      return { success: false, message: 'Failed to verify group ownership' };
    }
  }

  async checkUserHasGroupCopies(
    originalGroupIds: string[],
    userId: number,
  ): Promise<{ success: boolean; data?: Record<string, string> }> {
    try {
      const existingCopies = await this.databaseService.group.findMany({
        where: {
          userId,
          originalGroupId: { in: originalGroupIds },
        },
        select: { id: true, originalGroupId: true },
      });

      // Map original group ID to the user's copy ID
      const copyMap: Record<string, string> = {};
      existingCopies.forEach((copy) => {
        if (copy.originalGroupId) {
          copyMap[copy.originalGroupId] = copy.id;
        }
      });

      return { success: true, data: copyMap };
    } catch (err) {
      this.logger.error('Check group copies error:', err);
      return { success: false };
    }
  }

  async updateGroupPublicSettings(
    groupId: string,
    dto: UpdateGroupPublicDto,
  ): Promise<{ success: boolean; data?: Group; message?: string }> {
    try {
      const group = await this.databaseService.group.update({
        where: { id: groupId },
        data: {
          isPublic: dto.isPublic,
          description: dto.description,
          language: dto.language,
          tags: dto.tags,
        },
      });
      return { success: true, data: group };
    } catch (err: unknown) {
      this.logger.error('Update group public settings error:', err);
      return { success: false, message: 'Failed to update group settings' };
    }
  }

  async shareGroupWithUser(
    groupId: string,
    recipientEmail: string,
    senderId: number,
  ): Promise<{ success: boolean; data?: Group; message?: string }> {
    try {
      // Find recipient user
      const recipient = await this.databaseService.user.findUnique({
        where: { email: recipientEmail },
        select: { id: true, name: true },
      });

      if (!recipient) {
        return { success: false, message: 'User not found' };
      }

      if (recipient.id === senderId) {
        return { success: false, message: 'Cannot share with yourself' };
      }

      // Get sender info
      const sender = await this.databaseService.user.findUnique({
        where: { id: senderId },
        select: { name: true },
      });

      // Copy the group
      const copiedGroup = await this.copyGroupToUser(groupId, recipient.id, groupId);

      if (!copiedGroup) {
        return { success: false, message: 'Failed to copy group' };
      }

      // Send notification
      if (this.notificationService) {
        await this.notificationService.createNotification({
          userId: recipient.id,
          type: 'GROUP_SHARED',
          title: 'Group shared with you',
          message: `${sender?.name || 'Someone'} shared "${copiedGroup.name}" with you`,
          data: { groupId: copiedGroup.id, originalGroupId: groupId },
        });
      }

      return { success: true, data: copiedGroup };
    } catch (err: unknown) {
      this.logger.error('Share group error:', err);
      return { success: false, message: 'Failed to share group' };
    }
  }

  async copyPublicGroupToUser(
    groupId: string,
    userId: number,
  ): Promise<{ success: boolean; data?: Group; message?: string; alreadyExists?: boolean }> {
    try {
      // Verify the group is public
      const group = await this.databaseService.group.findUnique({
        where: { id: groupId },
        select: { isPublic: true, userId: true },
      });

      if (!group) {
        return { success: false, message: 'Group not found' };
      }

      if (!group.isPublic) {
        return { success: false, message: 'Group is not public' };
      }

      if (group.userId === userId) {
        return { success: false, message: 'You already own this group' };
      }

      // Check if user already has a copy of this group
      const existingCopy = await this.databaseService.group.findFirst({
        where: {
          userId,
          originalGroupId: groupId,
        },
      });

      if (existingCopy) {
        return { 
          success: false, 
          message: 'You have already added this group', 
          alreadyExists: true,
          data: existingCopy,
        };
      }

      const copiedGroup = await this.copyGroupToUser(groupId, userId, groupId);

      if (!copiedGroup) {
        return { success: false, message: 'Failed to copy group' };
      }

      return { success: true, data: copiedGroup };
    } catch (err: unknown) {
      this.logger.error('Copy public group error:', err);
      return { success: false, message: 'Failed to copy group' };
    }
  }

  private async copyGroupToUser(
    sourceGroupId: string,
    targetUserId: number,
    originalGroupId: string,
    parentId: string | null = null,
  ): Promise<Group | null> {
    try {
      // Get source group with cards and children
      const sourceGroup = await this.databaseService.group.findUnique({
        where: { id: sourceGroupId },
        include: {
          cards: true,
          children: {
            include: {
              cards: true,
            },
          },
        },
      });

      if (!sourceGroup) return null;

      // Create new group for target user
      const newGroup = await this.databaseService.group.create({
        data: {
          name: sourceGroup.name,
          description: sourceGroup.description,
          language: sourceGroup.language,
          tags: sourceGroup.tags,
          userId: targetUserId,
          parentId,
          originalGroupId,
          isPublic: false, // Copies are private by default
        },
      });

      // Copy cards
      if (sourceGroup.cards.length > 0) {
        await this.databaseService.card.createMany({
          data: sourceGroup.cards.map((card) => ({
            groupId: newGroup.id,
            questionText: card.questionText,
            questionType: card.questionType,
            questionMediaUrl: card.questionMediaUrl,
            answerText: card.answerText,
            answerType: card.answerType,
            answerMediaUrl: card.answerMediaUrl,
            // Reset spaced repetition fields for new owner
            nextReviewAt: new Date(),
            interval: 0,
            easeFactor: 2.5,
            repetitions: 0,
          })),
        });
      }

      // Recursively copy children
      for (const child of sourceGroup.children) {
        await this.copyGroupToUser(child.id, targetUserId, originalGroupId, newGroup.id);
      }

      return newGroup;
    } catch (err) {
      this.logger.error('Copy group to user error:', err);
      return null;
    }
  }
}
