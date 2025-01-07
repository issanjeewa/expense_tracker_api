import { Injectable } from '@nestjs/common';
import {
  MongooseModuleOptions,
  MongooseOptionsFactory,
} from '@nestjs/mongoose';

import { MongodbConfigService } from '../mongo/mongodb-config.service';

@Injectable()
export class MongooseOptionsService implements MongooseOptionsFactory {
  constructor(private readonly mongodbConfigService: MongodbConfigService) {}
  createMongooseOptions(): MongooseModuleOptions {
    return {
      appName: this.mongodbConfigService.appName,
      dbName: this.mongodbConfigService.dbName,
      uri: this.mongodbConfigService.connectionString,
    };
  }
}
