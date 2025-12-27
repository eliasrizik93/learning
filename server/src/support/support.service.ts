import { Injectable, Logger, ForbiddenException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { TicketStatus, TicketPriority } from '@prisma/client';
import { NotificationService } from '../notification/notification.service';

export interface CreateTicketDto {
  subject: string;
  description: string;
  priority?: TicketPriority;
}

export interface ReplyTicketDto {
  message: string;
}

@Injectable()
export class SupportService {
  private readonly logger = new Logger(SupportService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly notificationService: NotificationService,
  ) {}

  async createTicket(dto: CreateTicketDto, userId: number) {
    try {
      const ticket = await this.db.supportTicket.create({
        data: {
          subject: dto.subject,
          description: dto.description,
          priority: dto.priority || TicketPriority.MEDIUM,
          senderId: userId,
        },
        include: {
          sender: { select: { id: true, name: true, email: true } },
        },
      });

      return { success: true, data: ticket };
    } catch (e) {
      this.logger.error('Create ticket error:', e);
      return { success: false, message: 'Failed to create ticket' };
    }
  }

  async getUserTickets(userId: number) {
    try {
      const tickets = await this.db.supportTicket.findMany({
        where: { senderId: userId },
        include: {
          sender: { select: { id: true, name: true } },
          assignee: { select: { id: true, name: true } },
          replies: {
            include: {
              user: { select: { id: true, name: true } },
            },
            orderBy: { createdAt: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      return { success: true, data: tickets };
    } catch (e) {
      this.logger.error('Get user tickets error:', e);
      return { success: false, message: 'Failed to fetch tickets' };
    }
  }

  async getAllTickets(userId: number) {
    // Check if user is admin
    const user = await this.db.user.findUnique({
      where: { id: userId },
      select: { isAdmin: true },
    });

    if (!user?.isAdmin) {
      throw new ForbiddenException('Admin access required');
    }

    try {
      const tickets = await this.db.supportTicket.findMany({
        include: {
          sender: { select: { id: true, name: true, email: true } },
          assignee: { select: { id: true, name: true } },
          replies: {
            include: {
              user: { select: { id: true, name: true } },
            },
            orderBy: { createdAt: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      return { success: true, data: tickets };
    } catch (e) {
      this.logger.error('Get all tickets error:', e);
      return { success: false, message: 'Failed to fetch tickets' };
    }
  }

  async getTicketById(ticketId: string, userId: number) {
    try {
      const user = await this.db.user.findUnique({
        where: { id: userId },
        select: { isAdmin: true },
      });

      const ticket = await this.db.supportTicket.findUnique({
        where: { id: ticketId },
        include: {
          sender: { select: { id: true, name: true, email: true } },
          assignee: { select: { id: true, name: true } },
          replies: {
            include: {
              user: { select: { id: true, name: true } },
            },
            orderBy: { createdAt: 'asc' },
          },
        },
      });

      if (!ticket) {
        return { success: false, message: 'Ticket not found' };
      }

      // Only sender or admin can view
      if (ticket.senderId !== userId && !user?.isAdmin) {
        return { success: false, message: 'Access denied' };
      }

      return { success: true, data: ticket };
    } catch (e) {
      this.logger.error('Get ticket error:', e);
      return { success: false, message: 'Failed to fetch ticket' };
    }
  }

  async replyToTicket(ticketId: string, dto: ReplyTicketDto, userId: number) {
    try {
      const user = await this.db.user.findUnique({
        where: { id: userId },
        select: { isAdmin: true, name: true },
      });

      const ticket = await this.db.supportTicket.findUnique({
        where: { id: ticketId },
        select: { senderId: true },
      });

      if (!ticket) {
        return { success: false, message: 'Ticket not found' };
      }

      // Only sender or admin can reply
      if (ticket.senderId !== userId && !user?.isAdmin) {
        return { success: false, message: 'Access denied' };
      }

      const reply = await this.db.ticketReply.create({
        data: {
          ticketId,
          userId,
          message: dto.message,
        },
        include: {
          user: { select: { id: true, name: true } },
        },
      });

      // Update ticket status if admin replies
      if (user?.isAdmin && ticket.senderId !== userId) {
        await this.db.supportTicket.update({
          where: { id: ticketId },
          data: { status: TicketStatus.IN_PROGRESS },
        });

        // Notify the ticket sender
        await this.notificationService.createNotification({
          userId: ticket.senderId,
          type: 'TICKET_REPLY',
          title: 'New reply to your ticket',
          message: `${user.name} replied to your support ticket`,
          data: { ticketId },
        });
      }

      return { success: true, data: reply };
    } catch (e) {
      this.logger.error('Reply to ticket error:', e);
      return { success: false, message: 'Failed to reply to ticket' };
    }
  }

  async updateTicketStatus(ticketId: string, status: TicketStatus, userId: number) {
    try {
      const user = await this.db.user.findUnique({
        where: { id: userId },
        select: { isAdmin: true },
      });

      if (!user?.isAdmin) {
        return { success: false, message: 'Admin access required' };
      }

      const ticket = await this.db.supportTicket.update({
        where: { id: ticketId },
        data: { status },
        include: {
          sender: { select: { id: true, name: true } },
        },
      });

      // Notify user of status change
      await this.notificationService.createNotification({
        userId: ticket.senderId,
        type: 'TICKET_REPLY',
        title: 'Ticket status updated',
        message: `Your ticket "${ticket.subject}" is now ${status.toLowerCase().replace('_', ' ')}`,
        data: { ticketId },
      });

      return { success: true, data: ticket };
    } catch (e) {
      this.logger.error('Update ticket status error:', e);
      return { success: false, message: 'Failed to update ticket status' };
    }
  }

  async assignTicket(ticketId: string, assigneeId: number, adminId: number) {
    try {
      const admin = await this.db.user.findUnique({
        where: { id: adminId },
        select: { isAdmin: true },
      });

      if (!admin?.isAdmin) {
        return { success: false, message: 'Admin access required' };
      }

      const ticket = await this.db.supportTicket.update({
        where: { id: ticketId },
        data: { assigneeId },
        include: {
          assignee: { select: { id: true, name: true } },
        },
      });

      return { success: true, data: ticket };
    } catch (e) {
      this.logger.error('Assign ticket error:', e);
      return { success: false, message: 'Failed to assign ticket' };
    }
  }
}

