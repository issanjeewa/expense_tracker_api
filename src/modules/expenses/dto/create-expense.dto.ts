import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { currencies } from 'currencies.json';

export class CreateExpenseDTO {
  @ApiProperty({ required: true, description: 'Category ID' })
  @IsMongoId()
  category: string;

  @ApiProperty({
    required: true,
    description: 'Currency code',
    enum: currencies.map((currency) => currency.code),
  })
  @IsEnum(currencies.map((currency) => currency.code), {
    message: `currency should be a valid currency code `,
  })
  currency: string;

  @ApiProperty({ required: true, description: 'Amount' })
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount: number;

  @ApiProperty({ required: true, description: 'Expense date' })
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  date: Date;

  @ApiProperty({ required: true, description: 'Description about the expense' })
  @IsOptional()
  @IsString()
  description?: string;
}
