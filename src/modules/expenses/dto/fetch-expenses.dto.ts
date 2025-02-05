import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsOptional } from 'class-validator';
import { currencies } from 'currencies.json';

import { ProjectionExpenseDTO } from './projection-expense.dto';

export class FetchExpenseDTO extends PartialType(ProjectionExpenseDTO) {
  @ApiProperty({
    required: false,
    description: 'category id',
    example: '67a11df41cfb8ab174fcd00e',
  })
  @IsOptional()
  categoryId: string;

  @ApiProperty({ required: false, description: 'currency', example: 'USD' })
  @IsEnum(currencies.map((currency) => currency.code), {
    message: `currency should be a valid currency code `,
  })
  @IsOptional()
  currency: string;

  @ApiProperty({
    required: false,
    description: 'amount',
    example: '12.09',
  })
  @IsOptional()
  amount: number;

  @ApiProperty({
    required: false,
    description: 'expense description',
    example: 'for lunch',
  })
  @IsOptional()
  description: string;

  @ApiProperty({
    required: false,
    description: 'Expense date from',
    example: 'YYYY-MM-DD',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @ApiProperty({
    required: false,
    description: 'Expense date to',
    example: 'YYYY-MM-DD',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate: Date;
}
