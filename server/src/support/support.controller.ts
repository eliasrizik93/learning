import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { SupportService, CreateTicketDto, ReplyTicketDto } from './support.service';
import { GetUser } from '../auth/jwt-auth.guard';
import { CombinedAuthGuard } from '../device-auth/combined-auth.guard';
import { TicketStatus } from '@prisma/client';

@Controller('support')
@UseGuards(CombinedAuthGuard)
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Post('ticket')
  async createTicket(
    @Body() dto: CreateTicketDto,
    @GetUser() user: { id: number },
  ) {
    return this.supportService.createTicket(dto, user.id);
  }

  @Get('tickets')
  async getUserTickets(@GetUser() user: { id: number }) {
    return this.supportService.getUserTickets(user.id);
  }

  @Get('tickets/all')
  async getAllTickets(@GetUser() user: { id: number }) {
    return this.supportService.getAllTickets(user.id);
  }

  @Get('ticket/:id')
  async getTicket(
    @Param('id') id: string,
    @GetUser() user: { id: number },
  ) {
    return this.supportService.getTicketById(id, user.id);
  }

  @Post('ticket/:id/reply')
  async replyToTicket(
    @Param('id') id: string,
    @Body() dto: ReplyTicketDto,
    @GetUser() user: { id: number },
  ) {
    return this.supportService.replyToTicket(id, dto, user.id);
  }

  @Put('ticket/:id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: TicketStatus },
    @GetUser() user: { id: number },
  ) {
    return this.supportService.updateTicketStatus(id, body.status, user.id);
  }

  @Put('ticket/:id/assign')
  async assignTicket(
    @Param('id') id: string,
    @Body() body: { assigneeId: number },
    @GetUser() user: { id: number },
  ) {
    return this.supportService.assignTicket(id, body.assigneeId, user.id);
  }
}

