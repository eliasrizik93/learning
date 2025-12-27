import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { NotificationType, Prisma } from '@prisma/client';
import { EventsGateway } from '../events/events.gateway';

export interface CreateNotificationDto {
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  data?: Prisma.InputJsonValue;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly eventsGateway: EventsGateway,
  ) {}

  async createNotification(dto: CreateNotificationDto) {
    try {
      const notification = await this.db.notification.create({
        data: {
          userId: dto.userId,
          type: dto.type,
          title: dto.title,
          message: dto.message,
          data: dto.data ?? undefined,
        },
      });

      // Emit real-time notification
      this.eventsGateway.emitNotification(dto.userId, notification);

      return { success: true, data: notification };
    } catch (e) {
      this.logger.error('Create notification error:', e);
      return { success: false, message: 'Failed to create notification' };
    }
  }

  async getUserNotifications(userId: number) {
    try {
      const notifications = await this.db.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
      return { success: true, data: notifications };
    } catch (e) {
      this.logger.error('Get notifications error:', e);
      return { success: false, message: 'Failed to fetch notifications' };
    }
  }

  async getUnreadCount(userId: number) {
    try {
      const count = await this.db.notification.count({
        where: { userId, read: false },
      });
      return { success: true, data: count };
    } catch (e) {
      this.logger.error('Get unread count error:', e);
      return { success: false, message: 'Failed to get unread count' };
    }
  }

  async markAsRead(notificationId: string, userId: number) {
    try {
      const notification = await this.db.notification.updateMany({
        where: { id: notificationId, userId },
        data: { read: true },
      });
      return { success: true, data: notification };
    } catch (e) {
      this.logger.error('Mark as read error:', e);
      return { success: false, message: 'Failed to mark notification as read' };
    }
  }

  async markAllAsRead(userId: number) {
    try {
      await this.db.notification.updateMany({
        where: { userId, read: false },
        data: { read: true },
      });
      return { success: true };
    } catch (e) {
      this.logger.error('Mark all as read error:', e);
      return { success: false, message: 'Failed to mark all as read' };
    }
  }

  async deleteNotification(notificationId: string, userId: number) {
    try {
      await this.db.notification.deleteMany({
        where: { id: notificationId, userId },
      });
      return { success: true };
    } catch (e) {
      this.logger.error('Delete notification error:', e);
      return { success: false, message: 'Failed to delete notification' };
    }
  }
}

