import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  ArrayUnique,
  IsIn,
  IsOptional,
  IsString,
  isArray,
} from 'class-validator';

export function ProjectionType(allowed: string[]) {
  class Projection {
    @ApiProperty({
      required: false,
      description: 'comma-separated values',
      enum: allowed,
      type: [String],
      format: 'csv',
    })
    @IsOptional()
    @IsIn(allowed, { each: true })
    @IsString({ each: true })
    @ArrayUnique()
    @Transform(({ value }) => {
      if (isArray(value)) {
        return value;
      } else if (typeof value === 'string') {
        return value?.split(',').map((v: string) => v.trim());
      } else throw 'Invalid data';
    })
    select: string[];
  }

  return Projection;
}
