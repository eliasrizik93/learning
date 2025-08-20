import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { Group, Card } from '@prisma/client';

@Injectable()
export class GroupService {
  private readonly logger = new Logger(GroupService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  async createGroup(
    createGroupDto: CreateGroupDto,
    userId: number,
  ): Promise<{ success: boolean; data?: Group; message?: string }> {
    try {
      const group = await this.databaseService.group.create({
        data: {
          name: createGroupDto.name,
          userId,
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
  async getAllGroups(): Promise<(Group & { cards: Card[] })[]> {
    const groups = await this.databaseService.group.findMany({
      include: {
        cards: true,
      },
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
      this.databaseService.group.delete({ where: { id: groupId } });
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
}
