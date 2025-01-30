import { Test, TestingModule } from '@nestjs/testing';
import { EmailConfigService } from './email-config.service';

describe('EmailConfigService', () => {
  let service: EmailConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailConfigService],
    }).compile();

    service = module.get<EmailConfigService>(EmailConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
