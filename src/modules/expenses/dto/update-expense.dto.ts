import { PartialType } from '@nestjs/swagger';

import { CreateExpenseDTO } from './create-expense.dto';

export class UpdateExpenseDTO extends PartialType(CreateExpenseDTO) {}
