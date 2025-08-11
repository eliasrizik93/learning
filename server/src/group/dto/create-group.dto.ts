import { IsInt, IsString, Length, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateGroupDto {
  @IsString()
  @Length(1, 120)
  name!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  userId!: number;
}
