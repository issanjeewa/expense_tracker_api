import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { AuthConfigService } from 'src/config';
import { UsersService } from 'src/modules/users/users.service';

import { CurrentUser } from '../types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private readonly authConfigSvc: AuthConfigService,
    private userService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: authConfigSvc.jwtIgnoreTokenExpiry,
      secretOrKey: authConfigSvc.jwtSecret,
    });
  }

  async validate(payload: CurrentUser): Promise<CurrentUser> {
    try {
      const user = await this.userService.findOne(payload.id);
      if (!!user && !!user?.active) {
        return {
          active: user.active,
          email: user.email,
          id: user._id,
          name: user.name,
          role: user.role,
        };
      } else {
        throw new UnauthorizedException(`User not found or inactive.`);
      }
    } catch (error) {
      this.logger.error(`Error while validating jwt token, `, error);
      throw new UnauthorizedException(`User not found or inactive.`);
    }
  }
}
