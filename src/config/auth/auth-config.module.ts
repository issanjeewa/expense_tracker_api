import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AuthConfigService } from './auth-config.service';
import authConfig from './auth.config';

@Module({
  imports: [ConfigModule.forRoot({ load: [authConfig] })],
  providers: [AuthConfigService],
  exports: [AuthConfigService],
})
export class AuthConfigModule {}
