import { ConflictException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';

import { CurrentUser } from 'src/auth/types';
import { CategoryType } from 'src/common/enums/categories.enum';
import { Role } from 'src/common/enums/roles.enum';
import { PaginationProps } from 'src/common/middleware/pagination.middleware';

import { CategoriesService } from './categories.service';
import { CreateCategoryDTO } from './dto/create-category.dto';
import { FetchCategoriesDTO } from './dto/fetch-category.dto';
import { Category, CategoryDocument } from './schemas/category.schema';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let categoryModel: Model<CategoryDocument>;

  const mockCategory = {
    _id: '679c9a1a932f10f24fdd8ac9',
    name: 'Test Category',
    type: CategoryType.USER,
    user: '679bbbf2364d56bb500061af',
    _deleted: false,
    createdAt: '2025-01-31T09:38:34.013Z',
    updatedAt: '2025-01-31T09:38:34.013Z',
    __v: 0,
  };

  const mockUser: CurrentUser = {
    email: 'test@example.com',
    name: 'test user',
    role: Role.ADMIN,
    id: '67a1010275d6816989e77e6b',
    active: true,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: getModelToken(Category.name),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    categoryModel = module.get<Model<CategoryDocument>>(
      getModelToken(Category.name),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto = new CreateCategoryDTO();
    createDto.name = `Test Category`;
    it(`should create new category if it not exists`, async () => {
      jest.spyOn(categoryModel, 'findOne').mockImplementationOnce(
        () =>
          ({
            exec: jest.fn().mockReturnValueOnce(null),
          }) as any,
      );

      jest
        .spyOn(categoryModel, 'create')
        .mockResolvedValueOnce(mockCategory as any);

      const result = await service.create(createDto, mockUser);

      expect(categoryModel.findOne).toHaveBeenCalledWith({
        name: createDto.name,
        user: mockUser.id,
      });

      expect(categoryModel.create).toHaveBeenCalledWith({
        ...createDto,
        type: CategoryType.USER,
        user: mockUser.id,
      });

      expect(result).toEqual(mockCategory);
    });

    it(`should return conflict exception if category already exists`, async () => {
      jest.spyOn(categoryModel, 'findOne').mockImplementationOnce(
        () =>
          ({
            exec: jest.fn().mockReturnValueOnce(mockCategory),
          }) as any,
      );

      await expect(service.create(createDto, mockUser)).rejects.toThrow(
        ConflictException,
      );
    });

    it(`should restore if same category was found deleted`, async () => {
      const deletedCategory = {
        ...mockCategory,
        _deleted: true,
        save: jest.fn().mockReturnThis(),
      };

      jest.spyOn(categoryModel, 'findOne').mockImplementationOnce(
        () =>
          ({
            exec: jest.fn().mockReturnValueOnce(deletedCategory),
          }) as any,
      );

      const result = await service.create(createDto, mockUser);

      expect(categoryModel.findOne).toHaveBeenCalledWith({
        name: createDto.name,
        user: mockUser.id,
      });

      expect(deletedCategory.save).toHaveBeenCalled();

      expect(result).toEqual({ ...deletedCategory, _deleted: false });
    });
  });

  describe('createDefaultCategory', () => {
    const createDto = new CreateCategoryDTO();
    createDto.name = `Test Category`;

    const mockDefaultCategory = { ...mockCategory, type: CategoryType.DEFAULT };
    delete mockDefaultCategory.user;

    it(`should create new category if it not exists`, async () => {
      jest.spyOn(categoryModel, 'findOne').mockImplementationOnce(
        () =>
          ({
            exec: jest.fn().mockReturnValueOnce(null),
          }) as any,
      );

      jest
        .spyOn(categoryModel, 'create')
        .mockResolvedValueOnce(mockDefaultCategory as any);

      const result = await service.createDefaultCategory(createDto);

      expect(categoryModel.findOne).toHaveBeenCalledWith({
        name: createDto.name,
        type: CategoryType.DEFAULT,
      });

      expect(categoryModel.create).toHaveBeenCalledWith({
        ...createDto,
        type: CategoryType.DEFAULT,
      });

      expect(result).toEqual(mockDefaultCategory);
    });

    it(`should return conflict exception if category already exists`, async () => {
      jest.spyOn(categoryModel, 'findOne').mockImplementationOnce(
        () =>
          ({
            exec: jest.fn().mockReturnValueOnce(mockDefaultCategory),
          }) as any,
      );

      await expect(service.createDefaultCategory(createDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it(`should restore if same category was found deleted`, async () => {
      const deletedCategory = {
        ...mockDefaultCategory,
        _deleted: true,
        save: jest.fn().mockReturnThis(),
      };

      jest.spyOn(categoryModel, 'findOne').mockImplementationOnce(
        () =>
          ({
            exec: jest.fn().mockReturnValueOnce(deletedCategory),
          }) as any,
      );

      const result = await service.createDefaultCategory(createDto);

      expect(categoryModel.findOne).toHaveBeenCalledWith({
        name: createDto.name,
        type: CategoryType.DEFAULT,
      });

      expect(deletedCategory.save).toHaveBeenCalled();

      expect(result).toEqual({ ...deletedCategory, _deleted: false });
    });
  });

  describe(`findAll`, () => {
    it(`should fetch categories with pagination and filters`, async () => {
      const queryDto = new FetchCategoriesDTO();
      queryDto.name = `Test`;
      queryDto.type = CategoryType.USER;
      queryDto.select = ['name', 'type', 'user', 'createdAt', 'updatedAt'];

      const pagination: PaginationProps = {
        limit: 50,
        offset: 0,
        page: 1,
        sortBy: [['createdAt', 'desc']],
      };

      // Spy on the chained methods
      const selectSpy = jest.fn().mockReturnThis();
      const sortSpy = jest.fn().mockReturnThis();
      const skipSpy = jest.fn().mockReturnThis();
      const limitSpy = jest.fn().mockReturnThis();
      const execSpy = jest.fn().mockResolvedValue([mockCategory]);

      jest.spyOn(categoryModel, 'find').mockReturnValue({
        select: selectSpy,
        sort: sortSpy,
        skip: skipSpy,
        limit: limitSpy,
        exec: execSpy,
      } as any);

      const result = await service.findAll(queryDto, pagination, mockUser);

      expect(categoryModel.find).toHaveBeenCalledWith({
        $or: [{ user: mockUser.id }, { type: CategoryType.DEFAULT }],
        name: { $regex: queryDto.name, $options: 'i' },
        type: queryDto.type,
      });

      expect(sortSpy).toHaveBeenCalledWith([['createdAt', 'desc']]);
      expect(skipSpy).toHaveBeenCalledWith(0);
      expect(limitSpy).toHaveBeenCalledWith(50);

      expect(result).toEqual([mockCategory]);
    });
  });
});
