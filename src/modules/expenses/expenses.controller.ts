import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { Auth } from 'src/auth/decorators/auth.decorator';
import { User } from 'src/auth/decorators/user.decorator';
import { CurrentUser } from 'src/auth/types';
import { Role } from 'src/common/enums/roles.enum';
import { ResponseSerializerInterceptor } from 'src/common/interceptors/response-serializer.interceptor';
import { ParseMongoIdPipe } from 'src/common/pipes/parse-mongoid.pipe';

import { CreateExpenseDTO } from './dto/create-expense.dto';
import { UpdateExpenseDTO } from './dto/update-expense.dto';
import { ExpensesService } from './expenses.service';

@Auth(Role.ADMIN, Role.USER)
@ApiTags('Expenses')
@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  @UseInterceptors(ResponseSerializerInterceptor)
  create(
    @Body() createExpenseDto: CreateExpenseDTO,
    @User() user: CurrentUser,
  ) {
    return this.expensesService.create(createExpenseDto, user);
  }

  @Get()
  findAll() {
    return this.expensesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseMongoIdPipe) id: string) {
    return this.expensesService.findOne(+id);
  }

  @Patch(':id')
  @UseInterceptors(ResponseSerializerInterceptor)
  update(
    @Param('id', ParseMongoIdPipe) id: string,
    @Body() updateExpenseDto: UpdateExpenseDTO,
    @User() user: CurrentUser,
  ) {
    return this.expensesService.update(id, updateExpenseDto, user);
  }

  @Delete(':id')
  remove(@Param('id', ParseMongoIdPipe) id: string) {
    return this.expensesService.remove(+id);
  }
}
