import { IsEnum, IsInt } from 'class-validator';

export enum ReviewResponse {
  AGAIN = 'AGAIN',
  HARD = 'HARD',
  EASY = 'EASY',
}

export class ReviewCardDto {
  @IsInt()
  cardId: number;

  @IsEnum(ReviewResponse)
  response: ReviewResponse;
}
