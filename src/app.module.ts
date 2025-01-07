import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import {
  AppConfigModule,
  MongodbConfigModule,
  MongooseOptionsService,
} from './config';

@Module({
  imports: [
    AppConfigModule,
    MongooseModule.forRootAsync({
      imports: [MongodbConfigModule],
      useClass: MongooseOptionsService,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
