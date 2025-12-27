import {
  Controller,
  Get,
  Query,
  Param,
} from '@nestjs/common';
import { DiscoverService, SearchPublicGroupsDto } from './discover.service';

@Controller('discover')
export class DiscoverController {
  constructor(private readonly discoverService: DiscoverService) {}

  @Get('groups')
  async searchGroups(@Query() query: SearchPublicGroupsDto) {
    // Parse tags from comma-separated string
    if (query.tags && typeof query.tags === 'string') {
      query.tags = (query.tags as string).split(',').map((t) => t.trim());
    }
    if (query.page) query.page = Number(query.page);
    if (query.limit) query.limit = Number(query.limit);
    
    return this.discoverService.searchPublicGroups(query);
  }

  @Get('groups/:id')
  async getGroupPreview(@Param('id') id: string) {
    return this.discoverService.getPublicGroupPreview(id);
  }

  @Get('languages')
  async getLanguages() {
    return this.discoverService.getAvailableLanguages();
  }

  @Get('tags')
  async getTags() {
    return this.discoverService.getPopularTags();
  }
}

