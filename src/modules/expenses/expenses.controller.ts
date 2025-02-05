import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { Auth } from 'src/auth/decorators/auth.decorator';
import { User } from 'src/auth/decorators/user.decorator';
import { CurrentUser } from 'src/auth/types';
import { Pagination } from 'src/common/decorators/pagination.decorator';
import { Role } from 'src/common/enums/roles.enum';
import { ResponseSerializerInterceptor } from 'src/common/interceptors/response-serializer.interceptor';
import { PaginationProps } from 'src/common/middleware/pagination.middleware';
import { ParseMongoIdPipe } from 'src/common/pipes/parse-mongoid.pipe';

import { CreateExpenseDTO } from './dto/create-expense.dto';
import { FetchExpenseDTO } from './dto/fetch-expenses.dto';
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
  @UseInterceptors(ResponseSerializerInterceptor)
  findAll(
    @Query() queryDto: FetchExpenseDTO,
    @Pagination() pagination: PaginationProps,
    @User() user: CurrentUser,
  ) {
    return this.expensesService.findAll(queryDto, pagination, user);
  }

  @Get(':id')
  @UseInterceptors(ResponseSerializerInterceptor)
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
  @UseInterceptors(ResponseSerializerInterceptor)
  remove(@Param('id', ParseMongoIdPipe) id: string) {
    return this.expensesService.remove(+id);
  }
}
