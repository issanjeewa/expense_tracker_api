import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';

import authConfig from './auth.config';

@Injectable()
export class AuthConfigService {
  constructor(
    @Inject(authConfig.KEY)
    private readonly config: ConfigType<typeof authConfig>,
  ) {}

  get saltRounds(): number {
    return this.config.SaltRounds;
  }
}
