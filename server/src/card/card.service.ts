import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateCardDto } from './dto/create-card.dto';
import { Card, Prisma } from '@prisma/client';

@Injectable()
export class CardService {
  private readonly logger = new Logger(CardService.name);
  constructor(private readonly db: DatabaseService) {}
  async createCard(
    dto: CreateCardDto,
  ): Promise<{ success: boolean; data?: Card; message?: string }> {
    try {
      const question = String(dto.question).trim();
      const answer = String(dto.answer).trim();
      const groupId = String(dto.groupId);

      const card = await this.db.card.create({
        data: {
          question,
          answer,
          group: { connect: { id: groupId } },
        },
      });
      return { success: true, data: card };
    } catch (e: unknown) {
      if (e && typeof e === 'object' && 'code' in e) {
        const err = e as Prisma.PrismaClientKnownRequestError;
        if (err.code === 'P2025')
          return { success: false, message: 'Group not found.' };
        if (err.code === 'P2003')
          return { success: false, message: 'Invalid groupId.' };
      }
      const msg = e instanceof Error ? e.message : String(e);
      this.logger.error(`Create card error: ${msg}`);
      return { success: false, message: 'Failed to create card' };
    }
  }

  async getAllCards(): Promise<{ success: boolean; data?: Card[]; message?: string }> {
    try {
      const cards = await this.db.card.findMany({
        include: {
          group: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      return { success: true, data: cards };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      this.logger.error(`Get all cards error: ${msg}`);
      return { success: false, message: 'Failed to fetch cards' };
    }
  }
}
