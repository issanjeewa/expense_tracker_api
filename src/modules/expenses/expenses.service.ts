import {
  Injectable,
  Logger,
  NotFoundException,
  PreconditionFailedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { CurrentUser } from 'src/auth/types';

import { CategoriesService } from '../categories/categories.service';
import { CreateExpenseDTO } from './dto/create-expense.dto';
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

  findAll() {
    return `This action returns all expenses`;
  }

  findOne(id: number) {
    return `This action returns a #${id} expense`;
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
          user,
        );

        if (!newCategory)
          throw new PreconditionFailedException(`Category not valid.`);

        expense.category = new Types.ObjectId(newCategory.id);
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

      return { id: expense.id, message: `successfully updated` };
    } catch (error) {
      this.logger.error(`Error while updating expense.`, error);
      throw error;
    }
  }

  remove(id: number) {
    return `This action removes a #${id} expense`;
  }
}
