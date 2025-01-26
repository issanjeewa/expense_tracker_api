import {
  BadRequestException,
  Injectable,
  NestMiddleware,
  type Type,
  mixin,
} from '@nestjs/common';
import { matches } from 'class-validator';
import type { Request } from 'express';
import { set, size, unset } from 'lodash';
import type { SortOrder } from 'mongoose';

export type SortBy = [string, SortOrder];

export interface PaginationProps {
  offset?: number;
  limit?: number;
  page?: number;
  sortBy?: SortBy[];
}

type PaginationOptions = PaginationProps & {
  maxLimit?: number;
  sortableKeys?: string[];
};

export function PaginationMiddlewareFactory(
  options: PaginationOptions = { sortableKeys: ['createdAt'] },
): Type<NestMiddleware> {
  @Injectable()
  class PaginationMiddleware implements NestMiddleware {
    use(req: Request, res: any, next: (error?: any) => void) {
      const { query } = req;
      let offset =
        parseInt(query.offset?.toString(), 10) || options?.offset || 0;
      let limit = parseInt(query.limit?.toString(), 10) || options?.limit || 50;
      let page = parseInt(query.page?.toString(), 10) || options?.page || 1;
      let sortBy: SortBy[] = [];

      // validate sortby operator
      const rawSortBy: string[] =
        typeof query.sortBy === 'string'
          ? [query.sortBy]
          : (query.sortBy as string[]);

      if (size(query.sortBy as string[]) > 0) {
        for (const item of rawSortBy) {
          if (!matches(item, /^\w+:(desc|asc)$/)) {
            next(new BadRequestException(`Invalid sortBy option '${item}'`));
            break;
          } else {
            const [key, operator] = item.split(':');
            if (!options.sortableKeys.includes(key)) {
              next(
                new BadRequestException(
                  `Invalid sortBy key '${item}'. Only allowed [${options.sortableKeys?.join(
                    ', ',
                  )}]`,
                ),
              );
              break;
            }
            sortBy.push([key, operator as SortOrder]);
          }
        }
      } else {
        sortBy = options.sortBy || [['createdAt', 'desc']];
      }

      page = limit * (page - 1);
      if (offset <= 0) offset = 0;

      if (page <= 0) page = 0;

      if (limit > (options?.maxLimit || 100)) limit = options?.maxLimit || 100;

      unset(req.query, 'limit');
      unset(req.query, 'offset');
      unset(req.query, 'page');
      unset(req.query, 'sortBy');
      set(req, 'pagination', { limit, offset, page, sortBy });

      next();
    }
  }

  return mixin(PaginationMiddleware);
}
