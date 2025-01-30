import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';

import { EmailConfigService } from 'src/config';

import { SendEmailDTO } from './dto/send-email.dto';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private mailerService: MailerService,
    private emailConfig: EmailConfigService,
  ) {}

  /**
   * NOTE send email
   * @param params
   */
  async sendEmail(params: SendEmailDTO) {
    try {
      return await this.mailerService.sendMail({
        from: this.emailConfig.fromEmail,
        to: params.to.join(','),
        cc: params.cc?.join(',') || undefined,
        subject: params.subject,
        template: params.template,
        context: {
          message: params.message,
        },
      });
    } catch (error) {
      this.logger.error(`Error while sending email. `, error);
      throw error;
    }
  }
}
