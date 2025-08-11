import { PartialType } from '@nestjs/mapped-types';
import { CreateGroupDto } from './create-group.dto';
import { IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateGroupDto extends PartialType(CreateGroupDto) {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  userId?: number;
}
