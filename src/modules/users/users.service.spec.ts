import { ConflictException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { Model, Types } from 'mongoose';

import { Events } from 'src/common/enums/events.enum';
import { Role } from 'src/common/enums/roles.enum';
import { AuthConfigService } from 'src/config';

import { CreateUserDTO } from './dto/create-user.dto';
import { UserCreatedEvent } from './events/user-created.event';
import { User, UserDocument } from './schemas/user.schema';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let userModel: Model<UserDocument>;
  let eventEmitter: EventEmitter2;

  const mockUserDoc = {
    _id: new Types.ObjectId('679253b7bd8b12908a98df0a'),
    id: '679253b7bd8b12908a98df0a',
    email: 'user@exmaple.com',
    name: 'Example User',
    role: 'user',
    password: '$2b$10$eWsMg3.Go2deppqW6OHHJe38wb/ojLydvUogHJZKchehLPYME0QoC',
    _deleted: false,
    active: true,
    createdAt: '2025-01-23T14:35:35.176Z',
    updatedAt: '2025-01-23T14:35:35.176Z',
    __v: 0,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: {
            exists: jest.fn(),
            create: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: AuthConfigService,
          useValue: {
            saltRounds: jest.fn(),
          },
        },
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userModel = module.get<Model<UserDocument>>(getModelToken(User.name));
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe(`create`, () => {
    const createDto = new CreateUserDTO();
    createDto.email = 'user@exmaple.com';
    createDto.name = 'Example User';
    createDto.password = 'example-password';
    createDto.role = Role.USER;

    const mockTokenHash = 'MOCKED_TOKEN_HASH';
    const mockSalt = '$2b$10$sD3IUZK1yJKk5B1oPzqrXO';

    const mockToken = '123456';

    it(`should create user`, async () => {
      jest.spyOn(userModel, 'exists').mockResolvedValue(null);

      jest
        .spyOn(bcrypt, 'hash')
        .mockImplementationOnce(() => mockUserDoc.password);
      jest.spyOn(bcrypt, 'hash').mockImplementationOnce(() => mockTokenHash);
      jest.spyOn(bcrypt, 'genSalt').mockImplementation(() => mockSalt);
      jest.spyOn(Math, 'floor').mockImplementationOnce(() => +mockToken);
      jest.spyOn(eventEmitter, 'emit').mockReturnValueOnce(null);

      jest.spyOn(userModel, 'create').mockResolvedValue(mockUserDoc as any);

      const result = await service.create(createDto);

      expect(userModel.exists).toHaveBeenCalledWith({ email: createDto.email });
      expect(bcrypt.hash).toHaveBeenCalledWith(createDto.password, mockSalt);
      expect(bcrypt.hash).toHaveBeenCalledWith(mockToken, mockSalt);

      expect(userModel.create).toHaveBeenCalledWith({
        ...createDto,
        password: mockUserDoc.password,
        verificationToken: mockTokenHash,
      });

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        Events.USER_CREATED,
        new UserCreatedEvent(mockUserDoc.email, mockUserDoc.name, mockToken),
      );

      expect(result).toEqual({
        id: mockUserDoc.id,
        email: mockUserDoc.email,
        name: mockUserDoc.name,
      });
    });

    it(`should throw confect exception if user already exists`, async () => {
      jest.spyOn(userModel, 'exists').mockResolvedValue(mockUserDoc as any);
      await expect(service.create(createDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });
});
