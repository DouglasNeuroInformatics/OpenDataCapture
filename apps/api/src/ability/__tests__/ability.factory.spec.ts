import { beforeEach, describe, expect, it } from 'bun:test';

import { Test, TestingModule } from '@nestjs/testing';
import type { UserModel } from '@open-data-capture/database/core';

import { AbilityFactory } from '../ability.factory';

describe('AbilityFactory', () => {
  let abilityFactory: AbilityFactory;
  let userModelStub: UserModel;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AbilityFactory]
    }).compile();

    abilityFactory = module.get(AbilityFactory);
    userModelStub = {
      basePermissionLevel: null,
      createdAt: new Date(),
      firstName: null,
      groupIds: [],
      id: '12345',
      lastName: null,
      password: 'Password123',
      updatedAt: new Date(),
      username: 'user'
    };
  });

  describe('createForUser', () => {
    it('should return an empty rule set when the user has no basePermissionLevel', () => {
      const ability = abilityFactory.createForUser(userModelStub);
      expect(ability.rules).toBeArrayOfSize(0);
    });

    it('should return permission to manage all for an admin', () => {
      const ability = abilityFactory.createForUser({ ...userModelStub, basePermissionLevel: 'ADMIN' });
      expect(ability.rules).toMatchObject([{ action: 'manage', subject: 'all' }]);
    });
  });
});
