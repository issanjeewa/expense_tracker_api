import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { mongooseLeanVirtuals } from 'mongoose-lean-virtuals';

import { PaginationMiddlewareFactory } from 'src/common/middleware/pagination.middleware';

import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { Category, CategorySchema } from './schemas/category.schema';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Category.name,
        useFactory: () => {
          const schema = CategorySchema;
          schema.plugin(mongooseLeanVirtuals);
          return schema;
        },
      },
    ]),
  ],
  controllers: [CategoriesController],
  providers: [CategoriesService],
  exports: [CategoriesService],
})
export class CategoriesModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(PaginationMiddlewareFactory()).forRoutes({
      method: RequestMethod.GET,
      path: 'categories',
      version: '2',
    });
  }
}
