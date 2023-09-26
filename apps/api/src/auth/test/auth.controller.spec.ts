import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';

import { Test, TestingModule } from '@nestjs/testing';

import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';

import { createMock } from '@/core/testing/create-mock';

describe('AuthController', () => {
  let authController: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: createMock<AuthService>({
            login: () => {
              return Promise.resolve({
                accessToken: 'token'
              });
            }
          })
        }
      ]
    }).compile();

    authController = module.get(AuthController);
  });

  it('should be defined', () => {
    assert(authController);
  });
});
