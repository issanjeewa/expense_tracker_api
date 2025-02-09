import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { UsersService } from 'src/modules/users/users.service';

import { CurrentUser } from './types';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  /**
   * ANCHOR validate user
   * @param username
   * @param pass
   * @returns
   */
  async validateUser(username: string, pass: string): Promise<CurrentUser> {
    try {
      const user = await this.userService.findOne(username);

      if (!user?.active) {
        throw new UnauthorizedException(`User is inactive.`);
      }

      this.logger.debug(`User: ${username}`);

      const validate = await bcrypt.compare(pass, user?.password);

      if (!!validate) {
        return {
          active: user.active,
          email: user.email,
          id: user._id.toString(),
          name: user.name,
          role: user.role,
        };
      }

      return null;
    } catch (error) {
      this.logger.error(`Error while authenticating user.`, error);
      throw new UnauthorizedException();
    }
  }

  /**
   * return access token
   * @param user
   * @returns
   */
  async login(user: CurrentUser) {
    return {
      access_token: await this.jwtService.signAsync(user),
    };
  }
}
