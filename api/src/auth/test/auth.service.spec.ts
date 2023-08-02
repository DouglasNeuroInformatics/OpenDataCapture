import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';

import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';

import { defineAbility } from '@casl/ability';
import { AppAbility } from '@ddcp/types';

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
          useValue: createMock<AbilityFactory>({
            createForUser: () => {
              return defineAbility<AppAbility>((can) => {
                can('manage', 'all');
              });
            }
          })
        },
        {
          provide: ConfigService,
          useValue: createMock<ConfigService>({
            getOrThrow: (propertyPath: string) => propertyPath
          })
        },
        {
          provide: CryptoService,
          useValue: createMock<CryptoService>({
            comparePassword: () => Promise.resolve(true)
          })
        },
        {
          provide: JwtService,
          useValue: createMock<JwtService>({
            signAsync: () => Promise.resolve('mock-jwt')
          })
        },
        {
          provide: UsersService,
          useValue: createMock<UsersService>()
        }
      ]
    }).compile();

    authService = module.get(AuthService);
  });

  it('should be defined', () => {
    assert(authService);
  });
});
