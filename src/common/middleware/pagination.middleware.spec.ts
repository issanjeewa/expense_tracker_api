import { PaginationMiddlewareFactory } from './pagination.middleware';

describe('PaginationMiddleware', () => {
  it('should be defined', () => {
    const PaginationMiddleware = PaginationMiddlewareFactory();
    expect(new PaginationMiddleware()).toBeDefined();
  });
});
