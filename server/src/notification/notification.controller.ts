import {
  Controller,
  Get,
  Put,
  Delete,
  Param,
  UseGuards,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { GetUser } from '../auth/jwt-auth.guard';
import { CombinedAuthGuard } from '../device-auth/combined-auth.guard';

@Controller('notification')
@UseGuards(CombinedAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async getNotifications(@GetUser() user: { id: number }) {
    return this.notificationService.getUserNotifications(user.id);
  }

  @Get('unread-count')
  async getUnreadCount(@GetUser() user: { id: number }) {
    return this.notificationService.getUnreadCount(user.id);
  }

  @Put(':id/read')
  async markAsRead(
    @Param('id') id: string,
    @GetUser() user: { id: number },
  ) {
    return this.notificationService.markAsRead(id, user.id);
  }

  @Put('read-all')
  async markAllAsRead(@GetUser() user: { id: number }) {
    return this.notificationService.markAllAsRead(user.id);
  }

  @Delete(':id')
  async deleteNotification(
    @Param('id') id: string,
    @GetUser() user: { id: number },
  ) {
    return this.notificationService.deleteNotification(id, user.id);
  }
}

