import { Test, TestingModule } from '@nestjs/testing';

import { UsersRepository } from '../users.repository';
import { UsersService } from '../users.service';

import { MockUsersRepository } from './mocks/users.repository.mock';

import { CryptoService } from '@/crypto/crypto.service';
import { MockCryptoService } from '@/crypto/test/mocks/crypto.service.mock';
import { GroupsService } from '@/groups/groups.service';
import { MockGroupsService } from '@/groups/test/mocks/groups.service.mock';
import { PermissionsFactory } from '@/permissions/permissions.factory';
import { MockPermissionsFactory } from '@/permissions/test/mocks/permissions.factory.mock';

describe('UsersService', () => {
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: MockUsersRepository
        },
        {
          provide: GroupsService,
          useValue: MockGroupsService
        },
        {
          provide: CryptoService,
          useValue: MockCryptoService
        },
        {
          provide: PermissionsFactory,
          useValue: MockPermissionsFactory
        }
      ]
    }).compile();

    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(usersService).toBeDefined();
  });
});
