import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { ReviewCardDto } from './dto/review-card.dto';
import { CardService } from './card.service';

@Controller('card')
export class CardController {
  constructor(private readonly cardService: CardService) {}

  @Post()
  async createCard(@Body() createCardDto: CreateCardDto) {
    return await this.cardService.createCard(createCardDto);
  }

  @Get()
  async getAllCards() {
    return await this.cardService.getAllCards();
  }

  @Get('due')
  async getCardsDueForReview(@Query('groupId') groupId?: string) {
    return await this.cardService.getCardsDueForReview(groupId);
  }

  @Get(':id')
  async getCardById(@Param('id', ParseIntPipe) id: number) {
    return await this.cardService.getCardById(id);
  }

  @Get(':id/stats')
  async getCardStats(@Param('id', ParseIntPipe) id: number) {
    return await this.cardService.getCardStats(id);
  }

  @Put(':id')
  async updateCard(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCardDto: UpdateCardDto,
  ) {
    return await this.cardService.updateCard(id, updateCardDto);
  }

  @Delete(':id')
  async deleteCard(@Param('id', ParseIntPipe) id: number) {
    return await this.cardService.deleteCard(id);
  }

  @Post('review')
  async reviewCard(@Body() reviewCardDto: ReviewCardDto) {
    return await this.cardService.reviewCard(reviewCardDto);
  }
}
