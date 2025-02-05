import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as _ from 'lodash';
import { FilterQuery, Model } from 'mongoose';

import { CurrentUser } from 'src/auth/types';
import { CategoryType } from 'src/common/enums/categories.enum';
import { Role } from 'src/common/enums/roles.enum';
import { PaginationProps } from 'src/common/middleware/pagination.middleware';

import { CreateCategoryDTO } from './dto/create-category.dto';
import { FetchCategoriesDTO } from './dto/fetch-category.dto';
import {
  ProjectionCategoryDTO,
  defaultCategoryFields,
} from './dto/projection-category.dto';
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
          // TODO add to audit log

          return _.pick(checkCategory, 'id', 'name', 'type');
        }
      } else {
        const category = await this.categoryModel.create({
          ...createCategoryDto,
          type: CategoryType.USER,
          user: user.id,
        });

        // TODO add to audit log

        return category;
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

          // TODO add to audit log

          return _.pick(checkCategory, 'id', 'name', 'type');
        }
      } else {
        const category = await this.categoryModel.create({
          ...createDto,
          type: CategoryType.DEFAULT,
        });

        // TODO add to audit log

        return category;
      }
    } catch (error) {
      this.logger.error(`Error creating category:`, error);
      throw error;
    }
  }

  /**
   * ANCHOR fetch categories
   * @param queryDto
   * @param user
   */
  async findAll(
    queryDto: FetchCategoriesDTO,
    pagination: PaginationProps,
    user: CurrentUser,
  ) {
    try {
      const filter: FilterQuery<CategoryDocument> = {
        $or: [{ user: user.id }, { type: CategoryType.DEFAULT }],
        ...(!!queryDto?.name && {
          name: { $regex: queryDto.name, $options: 'i' },
        }),
        ...(!!queryDto?.type && { type: queryDto.type }),
      };

      console.log(pagination);

      const select = _.chain(
        !!queryDto?.select?.length ? queryDto.select : defaultCategoryFields,
      )
        .keyBy()
        .mapValues(() => 1)
        .value();

      const categories = await this.categoryModel
        .find(filter)
        .select(select)
        .sort(pagination.sortBy)
        .skip(pagination.offset)
        .limit(pagination.limit)
        .exec();

      return categories;
    } catch (error) {
      this.logger.error(`Error while fetching categories: `, error);
      throw error;
    }
  }

  /**
   * ANCHOR find one category
   * @param id
   * @returns
   */
  async findOne(
    id: string,
    user: CurrentUser,
    projection?: ProjectionCategoryDTO,
  ) {
    try {
      const select = _.chain(
        !!projection?.select?.length
          ? projection.select
          : defaultCategoryFields,
      )
        .keyBy()
        .mapValues(() => 1)
        .value();

      const category = await this.categoryModel
        .findOne({
          $or: [{ type: CategoryType.DEFAULT }, { user: user.id }],
          _id: id,
          _deleted: false,
        })
        .select(select)
        .lean({ virtuals: true })
        .exec();

      if (!category) throw new NotFoundException(`Category not found`);

      return category;
    } catch (error) {
      this.logger.error(`Error fetching:`, error);
      throw error;
    }
  }

  /**
   * ANCHOR update category
   * @param id
   * @param updateCategoryDto
   * @param user
   */
  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
    user: CurrentUser,
  ) {
    try {
      const category = await this.categoryModel
        .findOne({ _id: id, _deleted: false })
        .exec();

      if (!category) {
        throw new NotFoundException('Category not found');
      }

      if (category.type === CategoryType.DEFAULT && user.role !== 'admin') {
        throw new UnauthorizedException(
          'Only admin can update default category',
        );
      }

      if (
        category.type === CategoryType.USER &&
        user.id !== category?.user?._id?.toString()
      ) {
        throw new UnauthorizedException(
          'You are not allowed to update this category',
        );
      }

      // TODO Add to audit log

      category.name = updateCategoryDto.name;
      await category.save();

      return category;
    } catch (error) {
      this.logger.error(`Error while updating category:`, error);
      throw error;
    }
  }

  /**
   * ANCHOR remove category
   * @param id
   * @param user
   * @returns
   */
  async remove(id: string, user: CurrentUser) {
    try {
      const category = await this.categoryModel
        .findOne({ _id: id, _deleted: false })
        .exec();

      if (!category) {
        throw new NotFoundException('Category not found');
      }

      if (category.type === CategoryType.DEFAULT && user.role !== Role.ADMIN) {
        throw new UnauthorizedException(
          'Only admin can delete default category',
        );
      }

      if (
        category.type === CategoryType.USER &&
        user.id !== category?.user?._id?.toString()
      ) {
        throw new UnauthorizedException(
          'You are not allowed to delete this category',
        );
      }

      // TODO check if category is used in any transaction
      // TODO add to audit log

      category._deleted = true;
      await category.save();

      return { message: 'Category deleted successfully' };
    } catch (error) {
      this.logger.error(`Error while updating category:`, error);
      throw error;
    }
  }
}
