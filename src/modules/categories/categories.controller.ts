import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { Auth } from 'src/auth/decorators/auth.decorator';
import { User } from 'src/auth/decorators/user.decorator';
import { CurrentUser } from 'src/auth/types';
import { Role } from 'src/common/enums/roles.enum';

import { CategoriesService } from './categories.service';
import { CreateCategoryDTO } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Auth(Role.ADMIN, Role.USER)
  @Post()
  create(
    @Body() createCategoryDto: CreateCategoryDTO,
    @User() user: CurrentUser,
  ) {
    return this.categoriesService.create(createCategoryDto, user);
  }

  @Auth(Role.ADMIN)
  @Post('default')
  createDefault(@Body() createCategoryDto: CreateCategoryDTO) {
    return this.categoriesService.createDefaultCategory(createCategoryDto);
  }

  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(+id);
  }

  @Auth(Role.ADMIN, Role.USER)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @User() user: CurrentUser,
  ) {
    return this.categoriesService.update(id, updateCategoryDto, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(+id);
  }
}
