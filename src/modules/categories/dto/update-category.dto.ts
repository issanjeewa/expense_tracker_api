import { PartialType } from '@nestjs/swagger';

import { CreateCategoryDTO } from './create-category.dto';

export class UpdateCategoryDto extends PartialType(CreateCategoryDTO) {}
