import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { Group } from '@prisma/client';

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
  async getAllGroups(): Promise<Group[]> {
    const groups = await this.databaseService.group.findMany();
    return groups;
  }
}
