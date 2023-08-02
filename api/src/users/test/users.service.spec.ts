import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { beforeEach, describe, it } from 'node:test';

import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';

import { UserEntity } from '../entities/user.entity.js';
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
          provide: CryptoService,
          useValue: createMock<CryptoService>({
            hashPassword: (source) => Promise.resolve(randomBytes(source.length).toString('ascii'))
          })
        },
        {
          provide: GroupsService,
          useValue: createMock<GroupsService>()
        },
        {
          provide: getModelToken(UserEntity.modelName),
          useValue: {}
        }
      ]
    }).compile();

    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    assert(usersService);
  });
});
