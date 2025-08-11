import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  ParseIntPipe,
} from '@nestjs/common';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { GroupService } from './group.service';

@Controller('groups')
export class GroupController {
  constructor(private readonly groupsService: GroupService) {}

  @Post()
  async createGroup(@Body() createGroupDto: CreateGroupDto) {
    return await this.groupsService.createGroup(createGroupDto);
  }

  @Get()
  async getAllGroups() {
    return await this.groupsService.getAllGroups();
  }

  @Get(':id')
  async getGroupById(@Param('id') id: string) {
    return await this.groupsService.getGroupById(id);
  }

  @Get('user/:userId')
  async getGroupsByUserId(@Param('userId', ParseIntPipe) userId: number) {
    return await this.groupsService.getGroupsByUserId(userId);
  }

  @Put(':id')
  async updateGroup(
    @Param('id') id: string,
    @Body() updateGroupDto: UpdateGroupDto,
  ) {
    return await this.groupsService.updateGroup(id, updateGroupDto);
  }

  @Delete(':id')
  async deleteGroup(@Param('id') id: string) {
    return await this.groupsService.deleteGroup(id);
  }
}
