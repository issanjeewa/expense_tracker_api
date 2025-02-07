import { ConflictException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';

import { CurrentUser } from 'src/auth/types';
import { CategoryType } from 'src/common/enums/categories.enum';
import { Role } from 'src/common/enums/roles.enum';

import { CategoriesService } from './categories.service';
import { CreateCategoryDTO } from './dto/create-category.dto';
import { Category, CategoryDocument } from './schemas/category.schema';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let categoryModel: Model<CategoryDocument>;

  const mockCategory = {
    _id: '679c9a1a932f10f24fdd8ac9',
    name: 'Test Category',
    type: 'user',
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
            find: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                sort: jest.fn().mockReturnValue({
                  skip: jest.fn().mockReturnValue({
                    limit: jest.fn().mockReturnValue([mockCategory]),
                  }),
                }),
              }),
            }),
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
});
