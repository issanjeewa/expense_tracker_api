import { PartialType } from '@nestjs/swagger';

import { ProjectionType } from 'src/common/types/projection.type';

export const defaultExpenseFields = [
  'category',
  'currency',
  'amount',
  'description',
  'date',
  'createdAt',
];

export class ProjectionExpenseDTO extends PartialType(
  ProjectionType(defaultExpenseFields),
) {}
