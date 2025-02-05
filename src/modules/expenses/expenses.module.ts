import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { mongooseLeanVirtuals } from 'mongoose-lean-virtuals';

import { PaginationMiddlewareFactory } from 'src/common/middleware/pagination.middleware';

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
export class ExpensesModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        PaginationMiddlewareFactory({
          sortableKeys: [
            'date',
            'amount',
            'category',
            'currency',
            'createdAt',
            'updatedAt',
          ],
        }),
      )
      .forRoutes({
        method: RequestMethod.GET,
        path: 'expenses',
        version: '1',
      });
  }
}
