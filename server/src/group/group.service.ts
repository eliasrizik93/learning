import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { Group } from '@prisma/client';

@Injectable()
export class GroupService {
  constructor(private readonly databaseService: DatabaseService) {}

  async createGroup(
    createGroupDto: CreateGroupDto,
  ): Promise<{ success: boolean; data?: Group; message?: string }> {
    try {
      const group = await this.databaseService.group.create({
        data: {
          name: createGroupDto.name,
          userId: createGroupDto.userId,
        },
      });
      return { success: true, data: group };
    } catch (error) {
      console.error('Create group error:', error);
      return {
        success: false,
        message: 'Failed to create group',
      };
    }
  }

  async getAllGroups(): Promise<Group[]> {
    return await this.databaseService.group.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async getGroupById(id: string): Promise<Group | null> {
    return await this.databaseService.group.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        cards: true,
      },
    });
  }

  async getGroupsByUserId(userId: number): Promise<Group[]> {
    return await this.databaseService.group.findMany({
      where: { userId },
      include: {
        cards: true,
      },
    });
  }

  async updateGroup(
    id: string,
    updateGroupDto: UpdateGroupDto,
  ): Promise<{ success: boolean; data?: Group; message?: string }> {
    try {
      const group = await this.databaseService.group.update({
        where: { id },
        data: updateGroupDto,
      });
      return { success: true, data: group };
    } catch (error) {
      console.error('Update group error:', error);
      return {
        success: false,
        message: 'Failed to update group',
      };
    }
  }

  async deleteGroup(
    id: string,
  ): Promise<{ success: boolean; data?: Group; message?: string }> {
    try {
      const group = await this.databaseService.group.delete({
        where: { id },
      });
      return { success: true, data: group };
    } catch (error) {
      console.error('Delete group error:', error);
      return {
        success: false,
        message: 'Failed to delete group',
      };
    }
  }
}
