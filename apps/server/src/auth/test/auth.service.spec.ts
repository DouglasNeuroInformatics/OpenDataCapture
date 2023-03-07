import { Test, TestingModule } from '@nestjs/testing';

import { createMock } from '@golevelup/ts-jest';

import { AuthService } from '../auth.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '@/users/users.service';
import { NotFoundException } from '@nestjs/common';

import { UserStubs } from '@/users/test/users.stubs';

const MockConfigService = createMock<ConfigService>({
  getOrThrow(property: string) {
    return property;
  }
});

const MockJwtService = createMock<JwtService>({
  signAsync: () => {
    return Promise.resolve('');
  }
});

const MockUsersService = createMock<UsersService>({
  findByUsername: (username: string) => {
    switch (username) {
      case UserStubs.mockSystemAdmin.username:
        return Promise.resolve(UserStubs.mockSystemAdmin);
      case UserStubs.mockGroupManager.username:
        return Promise.resolve(UserStubs.mockGroupManager);
      case UserStubs.mockStandardUser.username:
        return Promise.resolve(UserStubs.mockStandardUser);
      default:
        throw new NotFoundException();
    }
  }
});

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: ConfigService,
          useValue: MockConfigService
        },
        {
          provide: JwtService,
          useValue: MockJwtService
        },
        {
          provide: UsersService,
          useValue: MockUsersService
        }
      ]
    }).compile();

    authService = module.get(AuthService);
    usersService = module.get(UsersService);
  });

  it('should be defined', () => {
    expect(usersService).toBeDefined();
  });
});
