import { MailerService } from '@nestjs-modules/mailer';
import { Test, TestingModule } from '@nestjs/testing';

import { EmailConfigService } from 'src/config';

import { SendEmailDTO } from './dto/send-email.dto';
import { EmailService } from './email.service';
import { EmailTemplate } from './enums';

describe('EmailService', () => {
  let service: EmailService;
  let nodeMailerService: MailerService;

  const mockMailConfig = {
    smtpServer: 'host.example.com',
    smtpPort: 3000,
    smtpUser: 'example.user@example.com',
    smtpPassword: 'test-password',
    fromEmail: 'expense-tracker.example.com',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: MailerService,
          useValue: {
            sendMail: jest.fn(),
          },
        },
        {
          provide: EmailConfigService,
          useValue: mockMailConfig,
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
    nodeMailerService = module.get<MailerService>(MailerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe(`sendEmail`, () => {
    const sendEmailDto = new SendEmailDTO();
    sendEmailDto.to = ['receiver1@example.com', 'receiver2@example.com'];
    sendEmailDto.cc = ['receiver3@example.com', 'receiver4@example.com'];
    sendEmailDto.subject = 'mail subject';
    sendEmailDto.message = `test message`;
    sendEmailDto.template = EmailTemplate.DEFAULT;

    it(`should call send email method accordingly`, async () => {
      jest.spyOn(nodeMailerService, 'sendMail').mockResolvedValue(true);

      await service.sendEmail(sendEmailDto);

      expect(nodeMailerService.sendMail).toHaveBeenCalledWith({
        from: mockMailConfig.fromEmail,
        to: 'receiver1@example.com,receiver2@example.com',
        cc: 'receiver3@example.com,receiver4@example.com',
        subject: sendEmailDto.subject,
        template: sendEmailDto.template,
        context: {
          message: sendEmailDto.message,
        },
      });
    });
  });
});
