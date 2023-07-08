import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';

import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';

import { AuthService } from '../auth.service.js';

import { AbilityFactory } from '@/ability/ability.factory.js';
import { createMock } from '@/core/testing/create-mock.js';
import { CryptoService } from '@/crypto/crypto.service.js';
import { UsersService } from '@/users/users.service.js';

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: AbilityFactory,
          useValue: createMock(AbilityFactory)
        },
        {
          provide: ConfigService,
          useValue: createMock(ConfigService)
        },
        {
          provide: CryptoService,
          useValue: createMock(CryptoService)
        },
        {
          provide: JwtService,
          useValue: createMock(JwtService)
        },
        {
          provide: UsersService,
          useValue: createMock(UsersService)
        }
      ]
    }).compile();

    authService = module.get(AuthService);
  });

  it('should be defined', () => {
    assert(authService);
  });
});
