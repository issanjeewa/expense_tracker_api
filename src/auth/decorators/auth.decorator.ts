import { SetMetadata, UseGuards, applyDecorators } from '@nestjs/common';

import { Role } from 'src/common/enums/roles.enum';

import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { UserTypeGuard } from '../guards/user-type.guard';

export const USER_ROLE_KEY = 'user_role';
export function Auth(...userRoles: Role[]) {
  return applyDecorators(
    SetMetadata(USER_ROLE_KEY, userRoles),
    UseGuards(JwtAuthGuard, UserTypeGuard),
  );
}
