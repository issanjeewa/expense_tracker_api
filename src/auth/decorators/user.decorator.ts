import { ExecutionContext } from '@nestjs/common';
import { createParamDecorator } from '@nestjs/common';

import { CurrentUser } from '../types';

export const User = createParamDecorator<string>(
  (key: string, ctx: ExecutionContext) => {
    const request: Request & { user: CurrentUser } = ctx
      .switchToHttp()
      .getRequest();
    const user = request.user;

    return key ? user?.[key] : user;
  },
);
