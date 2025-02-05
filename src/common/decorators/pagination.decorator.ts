import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';
import { Request } from 'express';
import { get } from 'lodash';

import { type PaginationProps } from '../middleware/pagination.middleware';

export const Pagination = createParamDecorator(
  (_data: any, ctx: ExecutionContext): PaginationProps => {
    const request: Request = ctx.switchToHttp().getRequest();
    return get(request, 'pagination', {});
  },
  [
    (target: any, key: string) => {
      ApiQuery({
        name: 'limit',
        schema: { type: 'number', default: 50 },
        required: false,
      })(target, key, Object.getOwnPropertyDescriptor(target, key));
      ApiQuery({
        name: 'offset',
        schema: { type: 'number', default: 0 },
        required: false,
      })(target, key, Object.getOwnPropertyDescriptor(target, key));
      ApiQuery({
        name: 'page',
        schema: { type: 'number', default: 1 },
        required: false,
      })(target, key, Object.getOwnPropertyDescriptor(target, key));
      ApiQuery({
        name: 'sortBy',
        schema: {
          type: 'array',
          items: {
            type: 'string',
            format: '<key>:<operation>',
            example: 'createdAt:desc',
          },
          default: ['createdAt:desc'],
        },
        isArray: true,
        required: false,
      })(target, key, Object.getOwnPropertyDescriptor(target, key));
    },
  ],
);
