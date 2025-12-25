import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum ContentType {
  TEXT = 'TEXT',
  AUDIO = 'AUDIO',
  VIDEO = 'VIDEO',
  IMAGE = 'IMAGE',
}

export class CreateCardDto {
  @IsOptional()
  @IsString()
  groupId?: string;

  // Question
  @IsOptional()
  @IsString()
  questionText?: string;

  @IsOptional()
  @IsEnum(ContentType)
  questionType?: ContentType;

  @IsOptional()
  @IsString()
  questionMediaUrl?: string;

  // Answer
  @IsOptional()
  @IsString()
  answerText?: string;

  @IsOptional()
  @IsEnum(ContentType)
  answerType?: ContentType;

  @IsOptional()
  @IsString()
  answerMediaUrl?: string;
}
