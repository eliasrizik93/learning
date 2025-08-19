// src/group/group.controller.ts
import { Body, Controller, Get, Post, UseGuards, Param } from '@nestjs/common';

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

  @Post(':id/card')
  @UseGuards(JwtAuthGuard)
  async addCardToGroup(
    @Param('id') groupId: string,
    @Body() body: { question: string; answer: string },
    @GetUser() user: { id: number },
  ) {
    // First verify the group belongs to the user
    const groupOwnership = await this.groupsService.verifyGroupOwnership(groupId, user.id);
    if (!groupOwnership.success) {
      return groupOwnership;
    }

    const createCardDto: CreateCardDto = {
      question: body.question,
      answer: body.answer,
      groupId: groupId,
    };
    return this.cardService.createCard(createCardDto);
  }
}
