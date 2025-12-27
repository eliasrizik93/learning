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
  HttpStatus,
  HttpException,
} from '@nestjs/common';

import { CreateGroupDto } from './dto/create-group.dto';
import { GroupService, UpdateGroupPublicDto, ShareGroupDto } from './group.service';
import { GetUser } from '../auth/jwt-auth.guard';
import { CombinedAuthGuard } from '../device-auth/combined-auth.guard';
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
  @UseGuards(CombinedAuthGuard)
  async createGroup(
    @Body() createGroupDto: CreateGroupDto,
    @GetUser() user: { id: number },
  ) {
    return this.groupsService.createGroup(createGroupDto, user.id);
  }

  @Get()
  @UseGuards(CombinedAuthGuard)
  async getAllGroups(@GetUser() user: { id: number }) {
    return this.groupsService.getAllGroups(user.id);
  }

  @Put(':id')
  @UseGuards(CombinedAuthGuard)
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
  @UseGuards(CombinedAuthGuard)
  async deleteGroup(@Param('id') id: string, @GetUser() user: { id: number }) {
    const ownerShipError = await this.checkGroupOwnership(id, user.id);
    if (ownerShipError) {
      return ownerShipError;
    }
    return this.groupsService.deleteGroup(id);
  }

  @Put(':id/move')
  @UseGuards(CombinedAuthGuard)
  async moveGroup(
    @Param('id') id: string,
    @Body() body: { parentId: string | null },
    @GetUser() user: { id: number },
  ) {
    const ownershipError = await this.checkGroupOwnership(id, user.id);
    if (ownershipError) {
      return ownershipError;
    }
    // If moving to a parent, verify ownership of parent too
    if (body.parentId) {
      const parentOwnershipError = await this.checkGroupOwnership(body.parentId, user.id);
      if (parentOwnershipError) {
        return parentOwnershipError;
      }
    }
    return this.groupsService.moveGroup(id, body.parentId);
  }

  @Post(':id/card')
  @UseGuards(CombinedAuthGuard)
  async addCardToGroup(
    @Param('id') groupId: string,
    @Body() body: CreateCardDto,
    @GetUser() user: { id: number },
  ) {
    const ownershipError = await this.checkGroupOwnership(groupId, user.id);
    if (ownershipError) {
      return ownershipError;
    }

    const createCardDto: CreateCardDto = {
      ...body,
      groupId: groupId,
    };
    return this.cardService.createCard(createCardDto);
  }

  @Get(':id/stats')
  @UseGuards(CombinedAuthGuard)
  async getGroupStats(
    @Param('id') groupId: string,
    @GetUser() user: { id: number },
  ) {
    const ownershipError = await this.checkGroupOwnership(groupId, user.id);
    if (ownershipError) {
      return ownershipError;
    }
    return this.cardService.getGroupStats(groupId);
  }

  @Get(':id/due')
  @UseGuards(CombinedAuthGuard)
  async getGroupDueCards(
    @Param('id') groupId: string,
    @GetUser() user: { id: number },
  ) {
    const ownershipError = await this.checkGroupOwnership(groupId, user.id);
    if (ownershipError) {
      return ownershipError;
    }
    return this.cardService.getCardsDueForReview(groupId);
  }

  @Post(':id/reset')
  @UseGuards(CombinedAuthGuard)
  async resetGroupProgress(
    @Param('id') groupId: string,
    @GetUser() user: { id: number },
  ) {
    const ownershipError = await this.checkGroupOwnership(groupId, user.id);
    if (ownershipError) {
      return ownershipError;
    }
    return this.cardService.resetGroupProgress(groupId);
  }

  @Get(':id/cards')
  @UseGuards(CombinedAuthGuard)
  async getGroupAllCards(
    @Param('id') groupId: string,
    @GetUser() user: { id: number },
  ) {
    const ownershipError = await this.checkGroupOwnership(groupId, user.id);
    if (ownershipError) {
      return ownershipError;
    }
    return this.cardService.getGroupAllCards(groupId);
  }

  @Put(':id/public')
  @UseGuards(CombinedAuthGuard)
  async updatePublicSettings(
    @Param('id') groupId: string,
    @Body() dto: UpdateGroupPublicDto,
    @GetUser() user: { id: number },
  ) {
    const ownershipError = await this.checkGroupOwnership(groupId, user.id);
    if (ownershipError) {
      return ownershipError;
    }
    return this.groupsService.updateGroupPublicSettings(groupId, dto);
  }

  @Post(':id/share')
  @UseGuards(CombinedAuthGuard)
  async shareGroup(
    @Param('id') groupId: string,
    @Body() dto: ShareGroupDto,
    @GetUser() user: { id: number },
  ) {
    const ownershipError = await this.checkGroupOwnership(groupId, user.id);
    if (ownershipError) {
      return ownershipError;
    }
    return this.groupsService.shareGroupWithUser(groupId, dto.recipientEmail, user.id);
  }

  @Post(':id/copy')
  @UseGuards(CombinedAuthGuard)
  async copyPublicGroup(
    @Param('id') groupId: string,
    @GetUser() user: { id: number },
  ) {
    const result = await this.groupsService.copyPublicGroupToUser(groupId, user.id);
    
    if (result.alreadyExists) {
      throw new HttpException(
        { 
          success: false, 
          message: result.message, 
          alreadyExists: true,
          existingGroupId: result.data?.id,
        },
        HttpStatus.CONFLICT,
      );
    }
    
    return result;
  }

  @Post('check-copies')
  @UseGuards(CombinedAuthGuard)
  async checkUserHasCopies(
    @Body() body: { groupIds: string[] },
    @GetUser() user: { id: number },
  ) {
    return this.groupsService.checkUserHasGroupCopies(body.groupIds, user.id);
  }
}
