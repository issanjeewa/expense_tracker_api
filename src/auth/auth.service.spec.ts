import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';

import { Role } from 'src/common/enums/roles.enum';
import { UsersService } from 'src/modules/users/users.service';

import { AuthService } from './auth.service';
import { CurrentUser } from './types';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUserDoc = {
    _id: '679253b7bd8b12908a98df0a',
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

  const mockCurrentUser: CurrentUser = {
    active: true,
    email: 'user@exmaple.com',
    id: '679253b7bd8b12908a98df0a',
    name: 'Example User',
    role: Role.USER,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            signAsync: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe(`validateUser`, () => {
    const mockUsername = 'user@example.com';
    const mockPassword = 'testpassword';

    it(`should return current-user object after successful validation`, async () => {
      jest.spyOn(usersService, 'findOne').mockResolvedValue(mockUserDoc as any);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      const result = await service.validateUser(mockUsername, mockPassword);

      expect(usersService.findOne).toHaveBeenCalledWith(mockUsername);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        mockPassword,
        mockUserDoc.password,
      );
      expect(result).toEqual(mockCurrentUser);
    });

    it(`should throw unauthorized exception if user is not active`, async () => {
      jest
        .spyOn(usersService, 'findOne')
        .mockResolvedValue({ ...mockUserDoc, active: false } as any);

      await expect(
        service.validateUser(mockUsername, mockPassword),
      ).rejects.toThrow(UnauthorizedException);
    });

    it(`should throw unauthorized exception if user is not found`, async () => {
      jest.spyOn(usersService, 'findOne').mockRejectedValue(NotFoundException);

      await expect(
        service.validateUser(mockUsername, mockPassword),
      ).rejects.toThrow(UnauthorizedException);
    });

    it(`should return null if user password not matching`, async () => {
      jest.spyOn(usersService, 'findOne').mockResolvedValue(mockUserDoc as any);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      const result = await service.validateUser(mockUsername, mockPassword);
      expect(usersService.findOne).toHaveBeenCalledWith(mockUsername);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        mockPassword,
        mockUserDoc.password,
      );
      expect(result).toEqual(null);
    });
  });

  describe(`login`, () => {
    it(`should return access token`, async () => {
      const mockAccessToken = `TestAccessToken`;

      jest
        .spyOn(jwtService, 'signAsync')
        .mockResolvedValue(mockAccessToken as never);

      const result = await service.login(mockCurrentUser);

      expect(jwtService.signAsync).toHaveBeenCalledWith(mockCurrentUser);
      expect(result).toEqual({ access_token: mockAccessToken });
    });
  });
});
