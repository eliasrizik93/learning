import { Body, Controller, Post } from '@nestjs/common';
import { CreateGroupDto } from './dto/create-group.dto';
import { GroupService } from './group.service';

@Controller('group')
export class GroupController {
  constructor(private readonly groupsService: GroupService) {}

  @Post()
  async createGroup(@Body() createGroupDto: CreateGroupDto) {
    return await this.groupsService.createGroup(createGroupDto);
  }
}
