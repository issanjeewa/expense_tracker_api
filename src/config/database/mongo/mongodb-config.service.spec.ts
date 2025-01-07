import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

import { MongodbConfigService } from './mongodb-config.service';
import databaseConfig from './mongodb.config';

describe('DatabaseConfigService', () => {
  let service: MongodbConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ load: [databaseConfig] })],
      providers: [MongodbConfigService],
    }).compile();

    service = module.get<MongodbConfigService>(MongodbConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
