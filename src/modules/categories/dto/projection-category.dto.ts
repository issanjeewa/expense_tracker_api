import { PartialType } from '@nestjs/swagger';

import { ProjectionType } from 'src/common/types/projection.type';

export const defaultCategoryFields = ['type', 'name', 'createdAt', 'updatedAt'];

export class ProjectionCategoryDTO extends PartialType(
  ProjectionType(defaultCategoryFields),
) {}
