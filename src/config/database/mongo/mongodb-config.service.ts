import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';

import mongodbConfig from './mongodb.config';

@Injectable()
export class MongodbConfigService {
  constructor(
    @Inject(mongodbConfig.KEY)
    private readonly config: ConfigType<typeof mongodbConfig>,
  ) {}

  get dbName(): string {
    return this.config.dbName;
  }

  get appName(): string {
    return this.config.appName;
  }

  get connectionString(): string {
    return this.config.connectionString;
  }
}
