import assert from 'node:assert/strict';
import { beforeEach, describe, it, mock } from 'node:test';

import { Test, TestingModule } from '@nestjs/testing';

import { UsersController } from '../users.controller.js';
import { UsersService } from '../users.service.js';

describe('UsersController', () => {
  let usersController: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mock.fn()
        }
      ]
    }).compile();

    usersController = module.get(UsersController);
  });

  it('should be defined', () => {
    assert(usersController);
  });
});
