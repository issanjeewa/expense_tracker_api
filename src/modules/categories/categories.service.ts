import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as _ from 'lodash';
import { Model } from 'mongoose';

import { CurrentUser } from 'src/auth/types';
import { CategoryType } from 'src/common/enums/categories.enum';

import { CreateCategoryDTO } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category, CategoryDocument } from './schemas/category.schema';

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);

  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  /**
   * ANCHOR create user defined categories
   * @param createCategoryDto
   * @param user
   */
  async create(createCategoryDto: CreateCategoryDTO, user: CurrentUser) {
    try {
      const checkCategory = await this.categoryModel
        .findOne({
          name: createCategoryDto.name,
          user: user.id,
        })
        .exec();

      // check if category already exists
      if (!!checkCategory) {
        if (!checkCategory._deleted) {
          throw new ConflictException('Category already exists');
        } else {
          // if deleted, restore
          checkCategory._deleted = false;
          await checkCategory.save();
          return _.pick(checkCategory, 'id', 'name', 'type');
        }
      } else {
        const category = await this.categoryModel.create({
          ...createCategoryDto,
          type: CategoryType.USER,
          user: user.id,
        });

        return _.pick(category, 'id', 'name', 'type');
      }
    } catch (error) {
      this.logger.error(`Error creating category:`, error);
      throw error;
    }
  }

  /**
   * ANCHOR create default categories
   * @param createDto
   * @param user
   */
  async createDefaultCategory(createDto: CreateCategoryDTO) {
    try {
      // check if category already exists
      const checkCategory = await this.categoryModel
        .findOne({ name: createDto.name, type: CategoryType.DEFAULT })
        .exec();

      if (!!checkCategory) {
        if (!checkCategory._deleted) {
          throw new ConflictException('Category already exists');
        } else {
          // if deleted, restore
          checkCategory._deleted = false;
          await checkCategory.save();
          return _.pick(checkCategory, 'id', 'name', 'type');
        }
      } else {
        const category = await this.categoryModel.create({
          ...createDto,
          type: CategoryType.DEFAULT,
        });

        return _.pick(category, 'id', 'name', 'type');
      }
    } catch (error) {
      this.logger.error(`Error creating category:`, error);
      throw error;
    }
  }

  findAll() {
    return `This action returns all categories`;
  }

  findOne(id: number) {
    return `This action returns a #${id} category`;
  }

  update(id: number, updateCategoryDto: UpdateCategoryDto) {
    return `This action updates a #${id} category ${updateCategoryDto}`;
  }

  remove(id: number) {
    return `This action removes a #${id} category`;
  }
}
