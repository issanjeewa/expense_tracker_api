import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

import { CategoryType } from 'src/common/enums/categories.enum';

import { ProjectionCategoryDTO } from './projection-category.dto';

export class FetchCategoriesDTO extends PartialType(ProjectionCategoryDTO) {
  @ApiProperty({ type: String, description: 'category name' })
  @IsString()
  @IsOptional()
  name: string;

  @ApiProperty({ enum: CategoryType })
  @IsEnum(CategoryType)
  @IsOptional()
  type: CategoryType;
}
