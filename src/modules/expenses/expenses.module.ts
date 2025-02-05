import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { mongooseLeanVirtuals } from 'mongoose-lean-virtuals';

import { CategoriesModule } from '../categories/categories.module';
import { ExpensesController } from './expenses.controller';
import { ExpensesService } from './expenses.service';
import { Expense, ExpenseSchema } from './schemas/expense.schema';

@Module({
  imports: [
    CategoriesModule,
    MongooseModule.forFeatureAsync([
      {
        name: Expense.name,
        useFactory: () => {
          const schema = ExpenseSchema;
          schema.plugin(mongooseLeanVirtuals);
          return schema;
        },
      },
    ]),
  ],
  controllers: [ExpensesController],
  providers: [ExpensesService],
})
export class ExpensesModule {}
