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

import { Auth } from 'src/auth/decorators/auth.decorator';
import { User } from 'src/auth/decorators/user.decorator';
import { CurrentUser } from 'src/auth/types';
import { Pagination } from 'src/common/decorators/pagination.decorator';
import { Role } from 'src/common/enums/roles.enum';
import { ResponseSerializerInterceptor } from 'src/common/interceptors/response-serializer.interceptor';
import { PaginationProps } from 'src/common/middleware/pagination.middleware';
import { ParseMongoIdPipe } from 'src/common/pipes/parse-mongoid.pipe';

import { CategoriesService } from './categories.service';
import { CreateCategoryDTO } from './dto/create-category.dto';
import { FetchCategoriesDTO } from './dto/fetch-category.dto';
import { ProjectionCategoryDTO } from './dto/projection-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Auth(Role.ADMIN, Role.USER)
  @Post()
  @UseInterceptors(ResponseSerializerInterceptor)
  create(
    @Body() createCategoryDto: CreateCategoryDTO,
    @User() user: CurrentUser,
  ) {
    return this.categoriesService.create(createCategoryDto, user);
  }

  @Auth(Role.ADMIN)
  @Post('default')
  @UseInterceptors(ResponseSerializerInterceptor)
  createDefault(@Body() createCategoryDto: CreateCategoryDTO) {
    return this.categoriesService.createDefaultCategory(createCategoryDto);
  }

  @Auth(Role.ADMIN, Role.USER)
  @Get()
  @UseInterceptors(ResponseSerializerInterceptor)
  findAll(
    @Query() query: FetchCategoriesDTO,
    @Pagination() pagination: PaginationProps,
    @User() user: CurrentUser,
  ) {
    return this.categoriesService.findAll(query, pagination, user);
  }

  @Auth(Role.ADMIN, Role.USER)
  @Get(':id')
  @UseInterceptors(ResponseSerializerInterceptor)
  findOne(
    @Param('id', ParseMongoIdPipe) id: string,
    @Query() projection: ProjectionCategoryDTO,
    @User() user: CurrentUser,
  ) {
    return this.categoriesService.findOne(id, projection, user);
  }

  @Auth(Role.ADMIN, Role.USER)
  @Patch(':id')
  @UseInterceptors(ResponseSerializerInterceptor)
  update(
    @Param('id', ParseMongoIdPipe) id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @User() user: CurrentUser,
  ) {
    return this.categoriesService.update(id, updateCategoryDto, user);
  }

  @Auth(Role.ADMIN, Role.USER)
  @Delete(':id')
  @UseInterceptors(ResponseSerializerInterceptor)
  remove(@Param('id', ParseMongoIdPipe) id: string, @User() user: CurrentUser) {
    return this.categoriesService.remove(id, user);
  }
}
