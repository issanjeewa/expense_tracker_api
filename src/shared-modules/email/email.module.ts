import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Module } from '@nestjs/common';
import { join } from 'path';

import { EmailConfigModule, EmailConfigService } from 'src/config';

import { EmailService } from './email.service';

@Module({
  imports: [
    EmailConfigModule,
    MailerModule.forRootAsync({
      imports: [EmailConfigModule],
      useFactory: async (emailConfig: EmailConfigService) => {
        return {
          transport: {
            pool: true,
            host: emailConfig.smtpServer,
            port: emailConfig.smtpPort || undefined,
            auth: {
              user: emailConfig.smtpUser,
              pass: emailConfig.smtpPassword,
            },
          },
          template: {
            dir: join(__dirname, 'templates'),
            adapter: new HandlebarsAdapter(),
            options: {
              strict: true,
            },
          },
        };
      },
      inject: [EmailConfigService],
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
