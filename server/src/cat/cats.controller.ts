import { Controller, Get, Post, Body } from '@nestjs/common';
import { CatsService } from './cats.service';
import { Cat } from './schemas/cat.schema';

@Controller('api/cats')
export class CatsController {
  constructor(private readonly catsService: CatsService) {}

  @Post()
  async create(@Body() cat: Partial<Cat>) {
    return this.catsService.create(cat);
  }

  @Get()
  async findAll() {
    return this.catsService.findAll();
  }
}
