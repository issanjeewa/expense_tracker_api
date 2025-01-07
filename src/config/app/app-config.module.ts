import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppConfigService } from './app-config.service';
import appConfig from './app.config';

@Module({
  imports: [ConfigModule.forRoot({ load: [appConfig] })],
  providers: [AppConfigService],
  exports: [AppConfigService],
})
export class AppConfigModule {}
