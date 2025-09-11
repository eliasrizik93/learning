import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateCardDto } from './dto/create-card.dto';
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
}
