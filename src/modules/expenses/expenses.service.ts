import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  PreconditionFailedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as _ from 'lodash';
import { FilterQuery, Model, Types } from 'mongoose';

import { CurrentUser } from 'src/auth/types';
import { PaginationProps } from 'src/common/middleware/pagination.middleware';

import { CategoriesService } from '../categories/categories.service';
import { CreateExpenseDTO } from './dto/create-expense.dto';
import { FetchExpenseDTO } from './dto/fetch-expenses.dto';
import {
  ProjectionExpenseDTO,
  defaultExpenseFields,
} from './dto/projection-expense.dto';
import { UpdateExpenseDTO } from './dto/update-expense.dto';
import { Expense, ExpenseDocument } from './schemas/expense.schema';

@Injectable()
export class ExpensesService {
  private readonly logger = new Logger(ExpensesService.name);

  constructor(
    @InjectModel(Expense.name)
    private expenseModel: Model<ExpenseDocument>,
    private categoryService: CategoriesService,
  ) {}

  /**
   * ANCHOR add expense
   * @param createExpenseDto
   * @param user
   */
  async create(createExpenseDto: CreateExpenseDTO, user: CurrentUser) {
    try {
      const category = await this.categoryService.findOne(
        createExpenseDto.category,
        null,
        user,
      );

      if (!category) {
        throw new PreconditionFailedException('Category not found');
      }

      const expense = await this.expenseModel.create({
        ...createExpenseDto,
        user: user.id,
      });

      return expense;
    } catch (error) {
      this.logger.error(`Error while adding expense.`, error);
      throw error;
    }
  }

  /**
   * ANCHOR fetch expenses
   * @param queryDto
   * @param pagination
   * @param user
   */
  async findAll(
    queryDto: FetchExpenseDTO,
    pagination: PaginationProps,
    user: CurrentUser,
  ) {
    try {
      const filter: FilterQuery<ExpenseDocument> = {
        user: user.id,
        ...(!!queryDto?.categoryId && { category: queryDto.categoryId }),
        ...(!!queryDto?.amount && { amount: queryDto.amount }),
        ...(!!queryDto?.currency && { currency: queryDto.currency }),
        ...(!!queryDto?.description && {
          description: { $regex: queryDto.description, $options: 'i' },
        }),
        ...((!!queryDto?.startDate || !!queryDto?.endDate) && {
          date: this.generateDateQuery(queryDto?.startDate, queryDto?.endDate),
        }),
      };

      const select = _.chain(
        !!queryDto?.select?.length ? queryDto.select : defaultExpenseFields,
      )
        .keyBy()
        .mapValues(() => 1)
        .value();

      const expensesQry = this.expenseModel.find(filter);

      if (!!_.has(select, 'category'))
        expensesQry.populate({ path: 'category', select: ['name'] });

      const expenses = await expensesQry
        .select(select)
        .sort(pagination.sortBy)
        .skip(pagination.offset)
        .limit(pagination.limit)
        .lean({ virtuals: true })
        .exec();

      return expenses;
    } catch (error) {
      this.logger.error(`Error while fetching expenses`);
      throw error;
    }
  }

  /**
   * ANCHOR find a category
   * @param id
   * @param projection
   * @param user
   */
  async findOne(
    id: string,
    projection: ProjectionExpenseDTO,
    user: CurrentUser,
  ) {
    try {
      const select = _.chain(
        !!projection?.select?.length ? projection.select : defaultExpenseFields,
      )
        .keyBy()
        .mapValues(() => 1)
        .value();

      const expense = await this.expenseModel
        .findOne({
          _id: id,
          user: user.id,
        })
        .select(select)
        .lean({ virtuals: true })
        .exec();

      if (!expense) throw new NotFoundException(`Expense not found.`);

      return expense;
    } catch (error) {
      this.logger.error(`Error while fetching expenses`);
      throw error;
    }
  }

  /**
   * ANCHOR update an expense
   * @param id
   * @param updateDto
   * @param user
   */
  async update(id: string, updateDto: UpdateExpenseDTO, user: CurrentUser) {
    try {
      const expense = await this.expenseModel
        .findOne({
          _id: id,
          user: user.id,
        })
        .exec();

      if (!expense) throw new NotFoundException(`Expense record not found.`);

      if (!!updateDto?.category) {
        const newCategory = await this.categoryService.findOne(
          updateDto.category,
          null,
          user,
        );

        if (!newCategory)
          throw new PreconditionFailedException(`Category not valid.`);

        expense.category = new Types.ObjectId(newCategory._id);
      }

      if (!!updateDto?.amount && updateDto.amount != expense.amount)
        expense.amount = updateDto.amount;
      if (!!updateDto?.currency && updateDto.currency != expense.currency)
        expense.currency = updateDto.currency;
      if (!!updateDto?.date && updateDto.date != expense.date)
        expense.date = updateDto.date;
      if (
        !!updateDto?.description &&
        updateDto.description != expense.description
      )
        expense.description = updateDto.description;

      // TODO add to audit

      await expense.save();

      return expense;
    } catch (error) {
      this.logger.error(`Error while updating expense.`, error);
      throw error;
    }
  }

  /**
   * ANCHOR remove expense
   * @param id
   * @param user
   * @returns
   */
  async remove(id: string, user: CurrentUser) {
    try {
      const exists = await this.expenseModel
        .exists({ _id: id, user: user.id })
        .exec();

      if (!exists) throw new NotFoundException(`Expense not found.`);

      await this.expenseModel.findByIdAndDelete(id).exec();

      return { message: `expense deleted` };
    } catch (error) {
      this.logger.error(`Error while removing expense.`, error);
      throw error;
    }
  }

  // SECTION Private (supportive) functions

  private generateDateQuery = (fromDate: Date | null, toDate: Date | null) => {
    if (fromDate && toDate) {
      if (fromDate > toDate) {
        throw new BadRequestException(
          'from date should be earlier than to date',
        );
      }
      return {
        $gte: fromDate,
        $lte: new Date(toDate.getTime() + 24 * 60 * 60 * 1000),
      };
    } else if (!!fromDate && !toDate) {
      return {
        $gte: new Date(fromDate),
      };
    } else if (!fromDate && !!toDate) {
      return {
        $lte: new Date(toDate.getTime() + 24 * 60 * 60 * 1000),
      };
    }
  };
}
