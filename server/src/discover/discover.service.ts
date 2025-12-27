import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

export interface SearchPublicGroupsDto {
  query?: string;
  language?: string;
  tags?: string[];
  page?: number;
  limit?: number;
}

@Injectable()
export class DiscoverService {
  private readonly logger = new Logger(DiscoverService.name);

  constructor(private readonly db: DatabaseService) {}

  async searchPublicGroups(dto: SearchPublicGroupsDto) {
    try {
      const page = dto.page || 1;
      const limit = Math.min(dto.limit || 20, 50);
      const skip = (page - 1) * limit;

      const where: any = {
        isPublic: true,
        parentId: null, // Only top-level groups
      };

      if (dto.query) {
        where.OR = [
          { name: { contains: dto.query, mode: 'insensitive' } },
          { description: { contains: dto.query, mode: 'insensitive' } },
        ];
      }

      if (dto.language) {
        where.language = { equals: dto.language, mode: 'insensitive' };
      }

      if (dto.tags && dto.tags.length > 0) {
        where.tags = { hasSome: dto.tags };
      }

      const [groups, total] = await Promise.all([
        this.db.group.findMany({
          where,
          include: {
            user: { select: { id: true, name: true } },
            _count: { select: { cards: true, children: true } },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        this.db.group.count({ where }),
      ]);

      return {
        success: true,
        data: {
          groups: groups.map((g) => ({
            id: g.id,
            name: g.name,
            description: g.description,
            language: g.language,
            tags: g.tags,
            createdAt: g.createdAt,
            creator: g.user,
            cardCount: g._count.cards,
            subgroupCount: g._count.children,
          })),
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
      };
    } catch (e) {
      this.logger.error('Search public groups error:', e);
      return { success: false, message: 'Failed to search groups' };
    }
  }

  async getPublicGroupPreview(groupId: string) {
    try {
      const group = await this.db.group.findUnique({
        where: { id: groupId, isPublic: true },
        include: {
          user: { select: { id: true, name: true } },
          cards: { take: 5, select: { id: true, questionText: true } },
          _count: { select: { cards: true, children: true } },
        },
      });

      if (!group) {
        return { success: false, message: 'Group not found or not public' };
      }

      return {
        success: true,
        data: {
          id: group.id,
          name: group.name,
          description: group.description,
          language: group.language,
          tags: group.tags,
          createdAt: group.createdAt,
          creator: group.user,
          cardCount: group._count.cards,
          subgroupCount: group._count.children,
          sampleCards: group.cards,
        },
      };
    } catch (e) {
      this.logger.error('Get public group preview error:', e);
      return { success: false, message: 'Failed to get group preview' };
    }
  }

  async getAvailableLanguages() {
    try {
      const languages = await this.db.group.findMany({
        where: { isPublic: true, language: { not: null } },
        select: { language: true },
        distinct: ['language'],
      });

      return {
        success: true,
        data: languages.map((l) => l.language).filter(Boolean),
      };
    } catch (e) {
      this.logger.error('Get languages error:', e);
      return { success: false, message: 'Failed to get languages' };
    }
  }

  async getPopularTags() {
    try {
      const groups = await this.db.group.findMany({
        where: { isPublic: true },
        select: { tags: true },
      });

      const tagCounts: Record<string, number> = {};
      groups.forEach((g) => {
        g.tags.forEach((tag) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      });

      const sortedTags = Object.entries(tagCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 20)
        .map(([tag, count]) => ({ tag, count }));

      return { success: true, data: sortedTags };
    } catch (e) {
      this.logger.error('Get popular tags error:', e);
      return { success: false, message: 'Failed to get tags' };
    }
  }
}

