// src/group/group.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  UseGuards,
  Param,
} from '@nestjs/common';

import { CreateGroupDto } from './dto/create-group.dto';
import { GroupService } from './group.service';
import { GetUser, JwtAuthGuard } from '../auth/jwt-auth.guard'; // ADD
import { CardService } from '../card/card.service';
import { CreateCardDto } from '../card/dto/create-card.dto';

@Controller('group')
export class GroupController {
  constructor(
    private readonly groupsService: GroupService,
    private readonly cardService: CardService,
  ) {}

  private async checkGroupOwnership(groupId: string, userId: number) {
    const groupOwnership = await this.groupsService.verifyGroupOwnership(
      groupId,
      userId,
    );
    if (!groupOwnership.success) {
      return groupOwnership;
    }
    return null; // null means ownership is valid
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createGroup(
    @Body() createGroupDto: CreateGroupDto,
    @GetUser() user: { id: number },
  ) {
    return this.groupsService.createGroup(createGroupDto, user.id);
  }

  @Get()
  @UseGuards()
  async getAllGroups() {
    return this.groupsService.getAllGroups();
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updateGroup(
    @Param('id') id: string,
    @Body() body: { name: string },
    @GetUser() user: { id: number },
  ) {
    const ownershipError = await this.checkGroupOwnership(id, user.id);
    if (ownershipError) {
      return ownershipError;
    }

    return this.groupsService.updateGroup(id, body.name);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteGroup(@Param('id') id: string, @GetUser() user: { id: number }) {
    const ownerShipError = await this.checkGroupOwnership(id, user.id);
    if (ownerShipError) {
      return ownerShipError;
    }
    return this.groupsService.deleteGroup(id);
  }

  @Post(':id/card')
  @UseGuards(JwtAuthGuard)
  async addCardToGroup(
    @Param('id') groupId: string,
    @Body() body: { question: string; answer: string },
    @GetUser() user: { id: number },
  ) {
    const ownershipError = await this.checkGroupOwnership(groupId, user.id);
    if (ownershipError) {
      return ownershipError;
    }

    const createCardDto: CreateCardDto = {
      question: body.question,
      answer: body.answer,
      groupId: groupId,
    };
    return this.cardService.createCard(createCardDto);
  }
}
