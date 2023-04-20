import { NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';

import { createMock } from '@golevelup/ts-jest';

import { AuthService } from '../auth.service';

import { AbilityFactory } from '@/ability/ability.factory';
import { MockAbilityFactory } from '@/ability/test/mocks/ability.factory.mock';
import { MockConfigService } from '@/core/test/mocks/config.service.mock';
import { CryptoService } from '@/crypto/crypto.service';
import { MockCryptoService } from '@/crypto/test/mocks/crypto.service.mock';
import { UsersService } from '@/users/users.service';

const MockJwtService = createMock<JwtService>({
  signAsync: () => {
    return Promise.resolve('');
  }
});

const MockUsersService = createMock<UsersService>({
  findByUsername: (username: string) => {
    switch (username) {
      /*
      case UserStubs.mockSystemAdmin.username:
        return Promise.resolve(UserStubs.mockSystemAdmin);
      case UserStubs.mockGroupManager.username:
        return Promise.resolve(UserStubs.mockGroupManager);
      case UserStubs.mockStandardUser.username:
        return Promise.resolve(UserStubs.mockStandardUser);
        */
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
          provide: AbilityFactory,
          useValue: MockAbilityFactory
        },
        {
          provide: ConfigService,
          useValue: MockConfigService
        },
        {
          provide: CryptoService,
          useValue: MockCryptoService
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
