import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { EmailConfigService } from './email-config.service';
import emailConfig from './email.config';

@Module({
  imports: [ConfigModule.forRoot({ load: [emailConfig] })],
  providers: [EmailConfigService],
  exports: [EmailConfigService],
})
export class EmailConfigModule {}
