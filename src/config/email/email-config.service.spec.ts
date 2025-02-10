import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

import { EmailConfigService } from './email-config.service';
import emailConfig from './email.config';

describe('EmailConfigService', () => {
  let service: EmailConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ load: [emailConfig] })],
      providers: [EmailConfigService],
    }).compile();

    service = module.get<EmailConfigService>(EmailConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
