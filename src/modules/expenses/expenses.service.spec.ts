import { NotFoundException, PreconditionFailedException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model, Types } from 'mongoose';

import { CurrentUser } from 'src/auth/types';
import { CategoryType } from 'src/common/enums/categories.enum';
import { Role } from 'src/common/enums/roles.enum';
import { PaginationProps } from 'src/common/middleware/pagination.middleware';

import { CategoriesService } from '../categories/categories.service';
import { CreateExpenseDTO } from './dto/create-expense.dto';
import { FetchExpenseDTO } from './dto/fetch-expenses.dto';
import { ProjectionExpenseDTO } from './dto/projection-expense.dto';
import { UpdateExpenseDTO } from './dto/update-expense.dto';
import { ExpensesService } from './expenses.service';
import { Expense, ExpenseDocument } from './schemas/expense.schema';

describe('ExpensesService', () => {
  let service: ExpensesService;
  let expenseModel: Model<ExpenseDocument>;
  let categoryService: CategoriesService;

  const mockUser: CurrentUser = {
    email: 'test@example.com',
    name: 'test user',
    role: Role.USER,
    id: '679bbbf2364d56bb500061af',
    active: true,
  };

  const mockCategory = {
    _id: new Types.ObjectId('679c9a1a932f10f24fdd8ac9'),
    name: 'Test Category',
    type: CategoryType.USER,
    user: new Types.ObjectId('679bbbf2364d56bb500061af'),
    _deleted: false,
    createdAt: '2025-01-31T09:38:34.013Z',
    updatedAt: '2025-01-31T09:38:34.013Z',
    __v: 0,
  };

  const mockExpense = {
    _id: new Types.ObjectId('67a3d8bd36505969ea30be19'),
    user: new Types.ObjectId('679bbbf2364d56bb500061af'),
    category: new Types.ObjectId('679e213f26fe9f023d6b94e2'),
    currency: 'EUR',
    amount: 23.98,
    description: 'Test description',
    date: '2025-01-31T22:00:00.000Z',
    createdAt: '2025-02-05T21:31:41.189Z',
    updatedAt: '2025-02-05T21:31:41.189Z',
    __v: 0,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExpensesService,
        {
          provide: getModelToken(Expense.name),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            exists: jest.fn(),
            findByIdAndDelete: jest.fn(),
          },
        },
        {
          provide: CategoriesService,
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ExpensesService>(ExpensesService);
    categoryService = module.get<CategoriesService>(CategoriesService);
    expenseModel = module.get<Model<ExpenseDocument>>(
      getModelToken(Expense.name),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe(`create`, () => {
    it(`should create expense`, async () => {
      const createDto = new CreateExpenseDTO();
      createDto.amount = 23.98;
      createDto.category = '679c9a1a932f10f24fdd8ac9';
      createDto.currency = 'EUR';
      createDto.date = new Date('2025-01-31T22:00:00.000Z');
      createDto.description = 'Test description';

      jest
        .spyOn(categoryService, 'findOne')
        .mockImplementation(() => mockCategory as any);

      jest
        .spyOn(expenseModel, 'create')
        .mockImplementation(() => mockExpense as any);

      const result = await service.create(createDto, mockUser);

      expect(categoryService.findOne).toHaveBeenCalledWith(
        createDto.category,
        null,
        mockUser,
      );

      expect(expenseModel.create).toHaveBeenCalledWith({
        ...createDto,
        user: mockUser.id,
      });

      expect(result).toEqual(mockExpense);
    });

    it(`should throw precondition failed error if category not found`, async () => {
      const createDto = new CreateExpenseDTO();
      createDto.amount = 23.98;
      createDto.category = '679c9a1a932f10f24fdd8ac9';
      createDto.currency = 'EUR';
      createDto.date = new Date('2025-01-31T22:00:00.000Z');
      createDto.description = 'Test description';

      jest
        .spyOn(categoryService, 'findOne')
        .mockImplementation(() => null as any);

      jest
        .spyOn(expenseModel, 'create')
        .mockImplementation(() => mockExpense as any);

      await expect(service.create(createDto, mockUser)).rejects.toThrow(
        'Category not found',
      );
    });
  });

  describe(`findAll`, () => {
    it(`should fetch expenses with pagination and filters`, async () => {
      const queryDto = new FetchExpenseDTO();
      queryDto.amount = 23.98;
      queryDto.categoryId = '679c9a1a932f10f24fdd8ac9';
      queryDto.currency = 'EUR';
      queryDto.description = 'Test desc';
      queryDto.startDate = new Date('2025-01-30T22:00:00.000Z');
      queryDto.endDate = new Date('2025-02-01T22:00:00.000Z');
      queryDto.select = [
        'category',
        'currency',
        'amount',
        'description',
        'date',
        'createdAt',
      ];

      const pagination: PaginationProps = {
        limit: 50,
        offset: 0,
        page: 1,
        sortBy: [['createdAt', 'desc']],
      };

      const spySelect = jest.fn().mockReturnThis();
      const spySort = jest.fn().mockReturnThis();
      const spySkip = jest.fn().mockReturnThis();
      const spyLimit = jest.fn().mockReturnThis();
      const spyLean = jest.fn().mockReturnThis();
      const spyPopulate = jest.fn().mockReturnThis();
      const spyExec = jest.fn().mockResolvedValue([mockExpense]);

      jest.spyOn(expenseModel, 'find').mockReturnValue({
        populate: spyPopulate,
        select: spySelect,
        sort: spySort,
        skip: spySkip,
        limit: spyLimit,
        lean: spyLean,
        exec: spyExec,
      } as any);

      const result = await service.findAll(queryDto, pagination, mockUser);

      expect(expenseModel.find).toHaveBeenCalledWith({
        user: mockUser.id,
        category: queryDto.categoryId,
        amount: queryDto.amount,
        currency: queryDto.currency,
        description: { $regex: queryDto.description, $options: 'i' },
        date: {
          $gte: queryDto.startDate,
          $lte: new Date('2025-02-02T22:00:00.000Z'),
        },
      });

      expect(spyPopulate).toHaveBeenCalledWith({
        path: 'category',
        select: ['name'],
      });

      expect(spySelect).toHaveBeenCalledWith({
        category: 1,
        currency: 1,
        amount: 1,
        description: 1,
        date: 1,
        createdAt: 1,
      });

      expect(spySort).toHaveBeenCalledWith(pagination.sortBy);
      expect(spySkip).toHaveBeenCalledWith(pagination.offset);
      expect(spyLean).toHaveBeenCalledWith({ virtuals: true });

      expect(result).toEqual([mockExpense]);
    });
  });

  describe(`findOne`, () => {
    const projection = new ProjectionExpenseDTO();
    projection.select = [
      'category',
      'currency',
      'amount',
      'description',
      'date',
      'createdAt',
    ];
    const id = '67a3d8bd36505969ea30be19';

    const expectedExpense = {
      category: mockExpense.category,
      currency: mockExpense.currency,
      amount: mockExpense.amount,
      description: mockExpense.description,
      date: mockExpense.date,
      createdAt: mockExpense.createdAt,
    };

    // Mock the chained methods
    const selectSpy = jest.fn().mockReturnThis();
    const leanSpy = jest.fn().mockReturnThis();
    const execSpy = jest.fn().mockResolvedValue(expectedExpense); // Resolve to mockExpense

    it(`should fetch expense with selection`, async () => {
      // Mock the findOne method
      jest.spyOn(expenseModel, 'findOne').mockReturnValue({
        select: selectSpy,
        lean: leanSpy,
        exec: execSpy,
      } as any);

      const result = await service.findOne(id, projection, mockUser);

      // Verify the select method
      expect(selectSpy).toHaveBeenCalledWith({
        category: 1,
        currency: 1,
        amount: 1,
        description: 1,
        date: 1,
        createdAt: 1,
      });

      // Verify the lean method
      expect(leanSpy).toHaveBeenCalledWith({ virtuals: true });

      // Verify the result
      expect(result).toEqual(expectedExpense);
    });

    it(`should throw not found exception if expense not found`, async () => {
      jest.spyOn(expenseModel, 'findOne').mockReturnValue({
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
    const newCategory = {
      id: '679c9f3c6117b2aad8bf91fa',
      name: 'Fuel',
      type: 'user',
      user: '679253b7bd8b12908a98df0a',
      _deleted: false,
      createdAt: '2025-01-31T10:00:28.962Z',
      updatedAt: '2025-02-03T13:32:57.357Z',
      __v: 0,
    };

    const id = '67a3d8bd36505969ea30be19';
    const updateDto = new UpdateExpenseDTO();
    updateDto.amount = 50.0;
    updateDto.category = '679c9f3c6117b2aad8bf91fa';
    updateDto.currency = 'USD';
    updateDto.date = new Date('2025-02-28');
    updateDto.description = 'Updated description';

    it(`should update the expense`, async () => {
      const mockExpenseDoc = {
        ...mockExpense,
        save: jest.fn().mockReturnThis(),
      };

      jest.spyOn(expenseModel, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockExpenseDoc),
      } as any);

      jest
        .spyOn(categoryService, 'findOne')
        .mockResolvedValue(newCategory as any);

      const result = await service.update(id, updateDto, mockUser);

      expect(expenseModel.findOne).toHaveBeenCalledWith({
        _id: id,
        user: mockUser.id,
      });

      expect(categoryService.findOne).toHaveBeenCalledWith(
        updateDto.category,
        null,
        mockUser,
      );

      expect(result).toEqual({
        ...mockExpenseDoc,
        amount: updateDto.amount,
        currency: updateDto.currency,
        date: updateDto.date,
        description: updateDto.description,
      });
    });

    it(`should throw not found exception if expense is not found`, async () => {
      jest.spyOn(expenseModel, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(service.update(id, updateDto, mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });

    it(`should throw precondition failed exception if new category is not valid`, async () => {
      const mockExpenseDoc = {
        ...mockExpense,
        save: jest.fn().mockReturnThis(),
      };

      jest.spyOn(expenseModel, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockExpenseDoc),
      } as any);

      jest.spyOn(categoryService, 'findOne').mockResolvedValue(null);

      await expect(service.update(id, updateDto, mockUser)).rejects.toThrow(
        PreconditionFailedException,
      );
    });
  });

  describe(`remove`, () => {
    const id = '67a3d8bd36505969ea30be19';
    it(`should remove expense`, async () => {
      jest.spyOn(expenseModel, 'exists').mockReturnValue({
        exec: jest.fn().mockResolvedValue(true),
      } as any);

      jest.spyOn(expenseModel, 'findByIdAndDelete').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockExpense),
      } as any);

      const result = await service.remove(id, mockUser);

      expect(expenseModel.exists).toHaveBeenCalledWith({
        _id: id,
        user: mockUser.id,
      });

      expect(expenseModel.findByIdAndDelete).toHaveBeenCalledWith(id);

      expect(result).toEqual({ message: `expense deleted` });
    });

    it(`should throw not found exception if expense not belong to the user`, async () => {
      jest.spyOn(expenseModel, 'exists').mockReturnValue({
        exec: jest.fn().mockResolvedValue(false),
      } as any);

      await expect(service.remove(id, mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
