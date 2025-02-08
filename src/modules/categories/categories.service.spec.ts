import { ConflictException, NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model, Types } from 'mongoose';

import { CurrentUser } from 'src/auth/types';
import { CategoryType } from 'src/common/enums/categories.enum';
import { Role } from 'src/common/enums/roles.enum';
import { PaginationProps } from 'src/common/middleware/pagination.middleware';

import { CategoriesService } from './categories.service';
import { CreateCategoryDTO } from './dto/create-category.dto';
import { FetchCategoriesDTO } from './dto/fetch-category.dto';
import { ProjectionCategoryDTO } from './dto/projection-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category, CategoryDocument } from './schemas/category.schema';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let categoryModel: Model<CategoryDocument>;

  const mockCategory = {
    _id: '679c9a1a932f10f24fdd8ac9',
    name: 'Test Category',
    type: CategoryType.USER,
    user: new Types.ObjectId('679bbbf2364d56bb500061af'),
    _deleted: false,
    createdAt: '2025-01-31T09:38:34.013Z',
    updatedAt: '2025-01-31T09:38:34.013Z',
    __v: 0,
  };

  const mockUser: CurrentUser = {
    email: 'test@example.com',
    name: 'test user',
    role: Role.USER,
    id: '679bbbf2364d56bb500061af',
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
      jest.spyOn(categoryModel, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(null),
      } as any);

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
      jest.spyOn(categoryModel, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockCategory),
      } as any);

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
      jest.spyOn(categoryModel, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(null),
      } as any);

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

      jest.spyOn(categoryModel, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(deletedCategory),
      } as any);

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

  describe(`findOne`, () => {
    const projection = new ProjectionCategoryDTO();
    projection.select = ['name', 'type', 'user', 'createdAt', 'updatedAt'];
    const id = '679c9a1a932f10f24fdd8ac9';

    const selectSpy = jest.fn().mockReturnThis();
    const leanSpy = jest.fn().mockReturnThis();
    const execSpy = jest.fn().mockReturnValue(mockCategory);

    it(`should fetch category with selection`, async () => {
      jest.spyOn(categoryModel, 'findOne').mockReturnValue({
        select: selectSpy,
        lean: leanSpy,
        exec: execSpy,
      } as any);

      const result = await service.findOne(id, projection, mockUser);

      expect(categoryModel.findOne).toHaveBeenCalledWith({
        $or: [{ type: CategoryType.DEFAULT }, { user: mockUser.id }],
        _id: id,
        _deleted: false,
      });

      expect(selectSpy).toHaveBeenCalledWith({
        name: 1,
        type: 1,
        user: 1,
        createdAt: 1,
        updatedAt: 1,
      });

      expect(leanSpy).toHaveBeenCalledWith({ virtuals: true });

      expect(result).toEqual(mockCategory);
    });

    it(`should throw not found exception if category not found`, async () => {
      jest.spyOn(categoryModel, 'findOne').mockReturnValue({
        select: selectSpy,
        lean: leanSpy,
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(service.findOne(id, projection, mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe(`update`, () => {
    const id = '679c9a1a932f10f24fdd8ac9';
    const updateDto = new UpdateCategoryDto();
    updateDto.name = 'updated name';

    it(`user can update own category`, async () => {
      const mockCategoryDoc = {
        ...mockCategory,
        save: jest.fn().mockReturnThis(),
      };

      jest.spyOn(categoryModel, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCategoryDoc),
      } as any);

      const result = await service.update(id, updateDto, mockUser);

      expect(categoryModel.findOne).toHaveBeenCalledWith({
        _id: id,
        _deleted: false,
      });

      expect(result).toEqual({ ...mockCategoryDoc, name: updateDto.name });
    });

    it(`admin user should be allowed to update a default category`, async () => {
      const defaultCategory = {
        ...mockCategory,
        type: CategoryType.DEFAULT,
        save: jest.fn().mockReturnThis(),
      };
      delete defaultCategory.user;

      const adminUser: CurrentUser = {
        ...mockUser,
        role: Role.ADMIN,
      };

      jest.spyOn(categoryModel, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue(defaultCategory),
      } as any);

      const result = await service.update(id, updateDto, adminUser);

      expect(categoryModel.findOne).toHaveBeenCalledWith({
        _id: id,
        _deleted: false,
      });

      expect(result).toEqual({ ...defaultCategory, name: updateDto.name });
    });

    it(`should throw not found exception if category not found`, async () => {
      jest.spyOn(categoryModel, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(service.update(id, updateDto, mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });

    it(`should throw unauthorized exception if user tries to change default category`, async () => {
      const mockCategoryDoc = {
        ...mockCategory,
        type: CategoryType.DEFAULT,
        save: jest.fn().mockReturnThis(),
      };

      const mockNormalUser: CurrentUser = {
        ...mockUser,
        role: Role.USER,
      };

      jest.spyOn(categoryModel, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCategoryDoc),
      } as any);

      await expect(
        service.update(id, updateDto, mockNormalUser),
      ).rejects.toThrow('Only admin can update default category');
    });

    it(`should throw unauthorized exception if user tries to change a category does not belongs to the user`, async () => {
      const mockCategoryDoc = {
        ...mockCategory,
        type: CategoryType.USER,
        user: new Types.ObjectId('679bbbf2364d56bb500061ae'),
        save: jest.fn().mockReturnThis(),
      };

      const mockNormalUser: CurrentUser = {
        ...mockUser,
        role: Role.USER,
      };

      jest.spyOn(categoryModel, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCategoryDoc),
      } as any);

      await expect(
        service.update(id, updateDto, mockNormalUser),
      ).rejects.toThrow('You are not allowed to update this category');
    });
  });

  describe(`remove`, () => {
    const id = '679c9a1a932f10f24fdd8ac9';

    it(`user can remove own category`, async () => {
      const mockCategoryDoc = {
        ...mockCategory,
        save: jest.fn().mockReturnThis(),
      };

      jest.spyOn(categoryModel, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCategoryDoc),
      } as any);

      const result = await service.remove(id, mockUser);

      expect(categoryModel.findOne).toHaveBeenCalledWith({
        _id: id,
        _deleted: false,
      });

      expect(mockCategoryDoc._deleted).toBe(true);

      expect(result).toEqual({ message: 'Category deleted successfully' });
    });

    it(`admin user should be allowed to remove a default category`, async () => {
      const defaultCategory = {
        ...mockCategory,
        type: CategoryType.DEFAULT,
        save: jest.fn().mockReturnThis(),
      };
      delete defaultCategory.user;

      const adminUser: CurrentUser = {
        ...mockUser,
        role: Role.ADMIN,
      };

      jest.spyOn(categoryModel, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue(defaultCategory),
      } as any);

      const result = await service.remove(id, adminUser);

      expect(categoryModel.findOne).toHaveBeenCalledWith({
        _id: id,
        _deleted: false,
      });

      expect(defaultCategory._deleted).toBe(true);

      expect(result).toEqual({ message: 'Category deleted successfully' });
    });

    it(`should throw not found exception if category not found`, async () => {
      jest.spyOn(categoryModel, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(service.remove(id, mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });

    it(`should throw unauthorized exception if user tries to remove default category`, async () => {
      const mockCategoryDoc = {
        ...mockCategory,
        type: CategoryType.DEFAULT,
        save: jest.fn().mockReturnThis(),
      };

      const mockNormalUser: CurrentUser = {
        ...mockUser,
        role: Role.USER,
      };

      jest.spyOn(categoryModel, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCategoryDoc),
      } as any);

      await expect(service.remove(id, mockNormalUser)).rejects.toThrow(
        'Only admin can delete default category',
      );
    });

    it(`should throw unauthorized exception if user tries to remove a category does not belongs to the user`, async () => {
      const mockCategoryDoc = {
        ...mockCategory,
        type: CategoryType.USER,
        user: new Types.ObjectId('679bbbf2364d56bb500061ae'),
        save: jest.fn().mockReturnThis(),
      };

      const mockNormalUser: CurrentUser = {
        ...mockUser,
        role: Role.USER,
      };

      jest.spyOn(categoryModel, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCategoryDoc),
      } as any);

      await expect(service.remove(id, mockNormalUser)).rejects.toThrow(
        'You are not allowed to delete this category',
      );
    });
  });
});
