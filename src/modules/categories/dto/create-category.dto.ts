import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ type: String, example: 'Food' })
  @IsString()
  @MinLength(2, { message: 'Name should be at least 2 characters' })
  @MaxLength(255, { message: 'Name can have only 255 characters' })
  name: string;
}
