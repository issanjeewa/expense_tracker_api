import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { size } from 'lodash';
import { includes } from 'lodash';
import { Observable } from 'rxjs';

import { Role } from 'src/common/enums/roles.enum';

import { USER_ROLE_KEY } from '../decorators/auth.decorator';

@Injectable()
export class UserTypeGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requiredUserTypes = this.reflector.getAllAndOverride<Role[]>(
      USER_ROLE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (size(requiredUserTypes) > 0) {
      const { user } = context.switchToHttp().getRequest();
      if (!includes(requiredUserTypes, user.role)) {
        throw new UnauthorizedException(
          'User not permitted to perform this action.',
        );
      }
      return true;
    }
    return true;
  }
}
