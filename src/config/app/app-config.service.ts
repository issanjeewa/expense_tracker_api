import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';

import appConfig, { Environment } from './app.config';

@Injectable()
export class AppConfigService {
  constructor(
    @Inject(appConfig.KEY)
    private readonly config: ConfigType<typeof appConfig>,
  ) {}

  get port(): number {
    return this.config.port;
  }

  get name(): string {
    return this.config.name;
  }

  get environment(): Environment {
    return this.config.nodeEnv;
  }
}
