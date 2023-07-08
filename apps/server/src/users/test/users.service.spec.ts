import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';

import { Test, TestingModule } from '@nestjs/testing';

import { UsersRepository } from '../users.repository.js';
import { UsersService } from '../users.service.js';

import { createMock } from '@/core/testing/create-mock.js';
import { CryptoService } from '@/crypto/crypto.service.js';
import { GroupsService } from '@/groups/groups.service.js';

describe('UsersService', () => {
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: createMock(UsersRepository)
        },
        {
          provide: GroupsService,
          useValue: createMock(GroupsService)
        },
        {
          provide: CryptoService,
          useValue: createMock(CryptoService)
        }
      ]
    }).compile();

    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    assert(usersService)
  });
});
