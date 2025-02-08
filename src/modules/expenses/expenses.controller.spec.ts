import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';

import { CurrentUser } from 'src/auth/types';
import { Role } from 'src/common/enums/roles.enum';

import { CreateExpenseDTO } from './dto/create-expense.dto';
import { ExpensesController } from './expenses.controller';
import { ExpensesService } from './expenses.service';

describe('ExpensesController', () => {
  let controller: ExpensesController;
  let service: ExpensesService;

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

  const mockUser: CurrentUser = {
    email: 'test@example.com',
    name: 'test user',
    role: Role.USER,
    id: '679bbbf2364d56bb500061af',
    active: true,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExpensesController],
      providers: [
        {
          provide: ExpensesService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ExpensesController>(ExpensesController);
    service = module.get<ExpensesService>(ExpensesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe(`create`, () => {
    it(`should call create service`, async () => {
      jest.spyOn(service, 'create').mockResolvedValue(mockExpense as any);

      const createDto = new CreateExpenseDTO();
      createDto.amount = 23.98;
      createDto.category = '679c9a1a932f10f24fdd8ac9';
      createDto.currency = 'EUR';
      createDto.date = new Date('2025-01-31T22:00:00.000Z');
      createDto.description = 'Test description';

      const result = await controller.create(createDto, mockUser);

      expect(service.create).toHaveBeenCalledWith(createDto, mockUser);
      expect(result).toEqual(mockExpense);
    });
  });
});
