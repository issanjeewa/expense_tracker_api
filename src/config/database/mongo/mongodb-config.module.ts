import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { MongodbConfigService } from './mongodb-config.service';
import mongodbConfig from './mongodb.config';

@Module({
  imports: [ConfigModule.forRoot({ load: [mongodbConfig] })],
  providers: [MongodbConfigService],
  exports: [MongodbConfigService],
})
export class MongodbConfigModule {}
