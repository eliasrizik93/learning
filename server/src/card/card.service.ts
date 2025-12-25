import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateCardDto } from './dto/create-card.dto';
import { ReviewCardDto, ReviewResponse } from './dto/review-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { Card, Prisma } from '@prisma/client';

export interface ServiceResponse<T = void> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface CardStats {
  cardId: number;
  totalReviews: number;
  easyCount: number;
  hardCount: number;
  againCount: number;
  currentInterval: number;
  easeFactor: number;
  repetitions: number;
  nextReviewAt: Date;
}

export interface GroupStats {
  groupId: string;
  totalCards: number;
  dueCards: number;
  newCards: number;
  learningCards: number;
  matureCards: number;
}

const isPrismaError = (e: unknown): e is Prisma.PrismaClientKnownRequestError =>
  e !== null && typeof e === 'object' && 'code' in e;

const getErrorMessage = (e: unknown): string =>
  e instanceof Error ? e.message : String(e);

@Injectable()
export class CardService {
  private readonly logger = new Logger(CardService.name);

  constructor(private readonly db: DatabaseService) {}

  async createCard(dto: CreateCardDto): Promise<ServiceResponse<Card>> {
    try {
      const card = await this.db.card.create({
        data: {
          groupId: dto.groupId,
          questionText: dto.questionText?.trim(),
          questionType: dto.questionType,
          questionMediaUrl: dto.questionMediaUrl,
          answerText: dto.answerText?.trim(),
          answerType: dto.answerType,
          answerMediaUrl: dto.answerMediaUrl,
        },
      });
      return { success: true, data: card };
    } catch (e: unknown) {
      if (isPrismaError(e)) {
        if (e.code === 'P2025') return { success: false, message: 'Group not found.' };
        if (e.code === 'P2003') return { success: false, message: 'Invalid groupId.' };
      }
      this.logger.error(`Create card error: ${getErrorMessage(e)}`);
      return { success: false, message: 'Failed to create card' };
    }
  }

  async updateCard(cardId: number, dto: UpdateCardDto): Promise<ServiceResponse<Card>> {
    try {
      const card = await this.db.card.update({
        where: { id: cardId },
        data: {
          questionText: dto.questionText?.trim(),
          questionType: dto.questionType,
          questionMediaUrl: dto.questionMediaUrl,
          answerText: dto.answerText?.trim(),
          answerType: dto.answerType,
          answerMediaUrl: dto.answerMediaUrl,
        },
      });
      return { success: true, data: card };
    } catch (e: unknown) {
      if (isPrismaError(e) && e.code === 'P2025') {
        return { success: false, message: 'Card not found.' };
      }
      this.logger.error(`Update card error: ${getErrorMessage(e)}`);
      return { success: false, message: 'Failed to update card' };
    }
  }

  async deleteCard(cardId: number): Promise<ServiceResponse> {
    try {
      await this.db.card.delete({ where: { id: cardId } });
      return { success: true };
    } catch (e: unknown) {
      if (isPrismaError(e) && e.code === 'P2025') {
        return { success: false, message: 'Card not found.' };
      }
      this.logger.error(`Delete card error: ${getErrorMessage(e)}`);
      return { success: false, message: 'Failed to delete card' };
    }
  }

  async getCardById(cardId: number): Promise<ServiceResponse<Card>> {
    try {
      const card = await this.db.card.findUnique({
        where: { id: cardId },
        include: { group: { select: { id: true, name: true } } },
      });
      if (!card) return { success: false, message: 'Card not found.' };
      return { success: true, data: card };
    } catch (e: unknown) {
      this.logger.error(`Get card error: ${getErrorMessage(e)}`);
      return { success: false, message: 'Failed to fetch card' };
    }
  }

  async getAllCards(): Promise<ServiceResponse<Card[]>> {
    try {
      const cards = await this.db.card.findMany({
        include: { group: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
      });
      return { success: true, data: cards };
    } catch (e: unknown) {
      this.logger.error(`Get all cards error: ${getErrorMessage(e)}`);
      return { success: false, message: 'Failed to fetch cards' };
    }
  }

  async getCardsDueForReview(groupId?: string, includeChildren = true): Promise<ServiceResponse<Card[]>> {
    try {
      const now = new Date();
      let groupIds: string[] | undefined;
      
      if (groupId) {
        if (includeChildren) {
          groupIds = await this.getAllGroupIds(groupId);
        } else {
          groupIds = [groupId];
        }
      }
      
      const cards = await this.db.card.findMany({
        where: {
          nextReviewAt: { lte: now },
          ...(groupIds && { groupId: { in: groupIds } }),
        },
        include: { group: { select: { id: true, name: true } } },
        orderBy: { nextReviewAt: 'asc' },
      });
      return { success: true, data: cards };
    } catch (e: unknown) {
      this.logger.error(`Get due cards error: ${getErrorMessage(e)}`);
      return { success: false, message: 'Failed to fetch due cards' };
    }
  }

  async reviewCard(dto: ReviewCardDto): Promise<ServiceResponse<Card>> {
    try {
      const card = await this.db.card.findUnique({ where: { id: dto.cardId } });
      if (!card) return { success: false, message: 'Card not found.' };

      // SM-2 algorithm implementation
      let { interval, easeFactor, repetitions } = card;
      const now = new Date();

      switch (dto.response) {
        case ReviewResponse.AGAIN:
          // Reset progress
          repetitions = 0;
          interval = 0;
          easeFactor = Math.max(1.3, easeFactor - 0.2);
          break;

        case ReviewResponse.HARD:
          // Slight penalty, but continue
          if (repetitions === 0) {
            interval = 1;
          } else if (repetitions === 1) {
            interval = 3;
          } else {
            interval = Math.round(interval * easeFactor * 0.8);
          }
          easeFactor = Math.max(1.3, easeFactor - 0.15);
          repetitions += 1;
          break;

        case ReviewResponse.EASY:
          // Good progress
          if (repetitions === 0) {
            interval = 1;
          } else if (repetitions === 1) {
            interval = 6;
          } else {
            interval = Math.round(interval * easeFactor);
          }
          easeFactor = easeFactor + 0.1;
          repetitions += 1;
          break;
      }

      // Calculate next review date
      const nextReviewAt = new Date(now);
      nextReviewAt.setDate(nextReviewAt.getDate() + interval);

      // Update card and create review record
      const [updatedCard] = await this.db.$transaction([
        this.db.card.update({
          where: { id: dto.cardId },
          data: { interval, easeFactor, repetitions, nextReviewAt },
        }),
        this.db.cardReview.create({
          data: { cardId: dto.cardId, response: dto.response },
        }),
      ]);

      return { success: true, data: updatedCard };
    } catch (e: unknown) {
      this.logger.error(`Review card error: ${getErrorMessage(e)}`);
      return { success: false, message: 'Failed to review card' };
    }
  }

  async getCardStats(cardId: number): Promise<ServiceResponse<CardStats>> {
    try {
      const card = await this.db.card.findUnique({
        where: { id: cardId },
        include: {
          reviews: { orderBy: { reviewedAt: 'desc' } },
        },
      });
      if (!card) return { success: false, message: 'Card not found.' };

      const totalReviews = card.reviews.length;
      const easyCount = card.reviews.filter((r) => r.response === 'EASY').length;
      const hardCount = card.reviews.filter((r) => r.response === 'HARD').length;
      const againCount = card.reviews.filter((r) => r.response === 'AGAIN').length;

      return {
        success: true,
        data: {
          cardId: card.id,
          totalReviews,
          easyCount,
          hardCount,
          againCount,
          currentInterval: card.interval,
          easeFactor: card.easeFactor,
          repetitions: card.repetitions,
          nextReviewAt: card.nextReviewAt,
        },
      };
    } catch (e: unknown) {
      this.logger.error(`Get card stats error: ${getErrorMessage(e)}`);
      return { success: false, message: 'Failed to fetch card stats' };
    }
  }

  async getGroupStats(groupId: string): Promise<ServiceResponse<GroupStats>> {
    try {
      const now = new Date();
      const cards = await this.db.card.findMany({
        where: { groupId },
        include: { reviews: true },
      });

      const totalCards = cards.length;
      const dueCards = cards.filter((c) => c.nextReviewAt <= now).length;
      const newCards = cards.filter((c) => c.repetitions === 0).length;
      const learningCards = cards.filter((c) => c.repetitions > 0 && c.interval < 21).length;
      const matureCards = cards.filter((c) => c.interval >= 21).length;

      return {
        success: true,
        data: {
          groupId,
          totalCards,
          dueCards,
          newCards,
          learningCards,
          matureCards,
        },
      };
    } catch (e: unknown) {
      this.logger.error(`Get group stats error: ${getErrorMessage(e)}`);
      return { success: false, message: 'Failed to fetch group stats' };
    }
  }

  // Helper to get all group IDs recursively (including children)
  private async getAllGroupIds(groupId: string): Promise<string[]> {
    const groupIds: string[] = [groupId];
    
    const children = await this.db.group.findMany({
      where: { parentId: groupId },
      select: { id: true },
    });
    
    for (const child of children) {
      const childIds = await this.getAllGroupIds(child.id);
      groupIds.push(...childIds);
    }
    
    return groupIds;
  }

  async getGroupAllCards(groupId: string, includeChildren = true): Promise<ServiceResponse<Card[]>> {
    try {
      let groupIds: string[];
      
      if (includeChildren) {
        groupIds = await this.getAllGroupIds(groupId);
      } else {
        groupIds = [groupId];
      }
      
      const cards = await this.db.card.findMany({
        where: { groupId: { in: groupIds } },
        include: { group: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'asc' },
      });
      return { success: true, data: cards };
    } catch (e: unknown) {
      this.logger.error(`Get group all cards error: ${getErrorMessage(e)}`);
      return { success: false, message: 'Failed to fetch group cards' };
    }
  }

  async resetGroupProgress(groupId: string): Promise<ServiceResponse> {
    try {
      // Reset all cards in the group to initial state
      await this.db.card.updateMany({
        where: { groupId },
        data: {
          nextReviewAt: new Date(),
          interval: 0,
          easeFactor: 2.5,
          repetitions: 0,
        },
      });

      // Delete all review history for cards in this group
      const cards = await this.db.card.findMany({
        where: { groupId },
        select: { id: true },
      });
      const cardIds = cards.map((c) => c.id);

      if (cardIds.length > 0) {
        await this.db.cardReview.deleteMany({
          where: { cardId: { in: cardIds } },
        });
      }

      return { success: true };
    } catch (e: unknown) {
      this.logger.error(`Reset group progress error: ${getErrorMessage(e)}`);
      return { success: false, message: 'Failed to reset group progress' };
    }
  }
}
