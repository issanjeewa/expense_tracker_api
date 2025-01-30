import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { Events } from 'src/common/enums/events.enum';
import { SendEmailDTO } from 'src/shared-modules/email/dto/send-email.dto';
import { EmailService } from 'src/shared-modules/email/email.service';
import { EmailTemplate } from 'src/shared-modules/email/enums';

import { UserCreatedEvent } from '../events/user-created.event';

@Injectable()
export class UserCreatedEventHandler {
  private readonly logger = new Logger(UserCreatedEventHandler.name);

  constructor(private readonly emailService: EmailService) {}

  @OnEvent(Events.USER_CREATED)
  async handleUserCreatedEvent(event: UserCreatedEvent) {
    this.logger.debug(`User created event data: ${JSON.stringify(event)}`);

    try {
      const sendEmailDto = new SendEmailDTO();

      sendEmailDto.to = [event.email];
      sendEmailDto.subject = 'Please verify your email';
      sendEmailDto.message = `Welcome ${event.name}, Please verify your email by using token: ${event.verificationToken}`;
      sendEmailDto.template = EmailTemplate.DEFAULT;

      await this.emailService.sendEmail(sendEmailDto);
    } catch (error) {
      this.logger.error(`Failed to send email to ${event.email} `, error);
    }
  }
}
