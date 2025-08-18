// src/group/group.controller.ts
import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';

import { CreateGroupDto } from './dto/create-group.dto';
import { GroupService } from './group.service';
import { GetUser, JwtAuthGuard } from '../auth/jwt-auth.guard'; // ADD

@Controller('group')
export class GroupController {
  constructor(private readonly groupsService: GroupService) {}

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
}
