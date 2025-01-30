import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';

import emailConfig from './email.config';

@Injectable()
export class EmailConfigService {
  constructor(
    @Inject(emailConfig.KEY)
    private readonly config: ConfigType<typeof emailConfig>,
  ) {}

  get smtpServer(): string {
    return this.config.smtpServer;
  }

  get smtpPort(): number {
    return this.config.smtpPort;
  }

  get smtpUser(): string {
    return this.config.smtpUser;
  }

  get smtpPassword(): string {
    return this.config.smtpPassword;
  }

  get fromEmail(): string {
    return this.config.fromEmail;
  }
}
