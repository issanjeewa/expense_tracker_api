import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MongooseModule } from '@nestjs/mongoose';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import {
  AppConfigModule,
  MongodbConfigModule,
  MongooseOptionsService,
} from './config';
import { CategoriesModule } from './modules/categories/categories.module';
import { UsersModule } from './modules/users/users.module';
import { EmailModule } from './shared-modules/email/email.module';
import { ExpensesModule } from './modules/expenses/expenses.module';

@Module({
  imports: [
    AppConfigModule,
    MongooseModule.forRootAsync({
      imports: [MongodbConfigModule],
      useClass: MongooseOptionsService,
    }),
    EventEmitterModule.forRoot(),
    UsersModule,
    CategoriesModule,
    AuthModule,
    EmailModule,
    ExpensesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
