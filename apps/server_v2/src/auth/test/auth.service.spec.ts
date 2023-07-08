import assert from 'node:assert/strict';
import { beforeEach, describe, it, mock } from 'node:test';

import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';

import { AuthService } from '../auth.service.js';

import { AbilityFactory } from '@/ability/ability.factory.js';
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
          useValue: mock.fn()
        },
        {
          provide: ConfigService,
          useValue: mock.fn()
        },
        {
          provide: CryptoService,
          useValue: mock.fn()
        },
        {
          provide: JwtService,
          useValue: mock.fn()
        },
        {
          provide: UsersService,
          useValue: mock.fn()
        }
      ]
    }).compile();

    authService = module.get(AuthService);
  });

  it('should be defined', () => {
    assert(authService);
  });
});
