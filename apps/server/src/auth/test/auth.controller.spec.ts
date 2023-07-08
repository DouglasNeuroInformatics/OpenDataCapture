import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';

import { Test, TestingModule } from '@nestjs/testing';

import { AuthController } from '../auth.controller.js';
import { AuthService } from '../auth.service.js';

describe('AuthController', () => {
  let authController: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: () =>
              Promise.resolve({
                accessToken: 'token'
              })
          }
        }
      ]
    }).compile();

    authController = module.get(AuthController);
  });

  it('should be defined', () => {
    assert(authController)
  });
});
