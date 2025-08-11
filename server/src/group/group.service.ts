import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateGroupDto } from './dto/create-group.dto';
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
}
