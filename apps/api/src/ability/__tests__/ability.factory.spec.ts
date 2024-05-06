import { Test, TestingModule } from '@nestjs/testing';
import type { UserModel } from '@opendatacapture/prisma-client/api';
import { beforeEach, describe, expect, it } from 'vitest';

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
      firstName: 'Jane',
      groupIds: [],
      id: '12345',
      lastName: 'Doe',
      password: 'Password123',
      updatedAt: new Date(),
      username: 'user'
    };
  });

  describe('createForUser', () => {
    it('should return an empty rule set when the user has no basePermissionLevel', () => {
      const ability = abilityFactory.createForUser(userModelStub);
      expect(Array.isArray(ability.rules)).toBe(true);
      expect(ability.rules.length).toBe(0);
    });

    it('should return permission to manage all for an admin', () => {
      const ability = abilityFactory.createForUser({ ...userModelStub, basePermissionLevel: 'ADMIN' });
      expect(ability.rules).toMatchObject([{ action: 'manage', subject: 'all' }]);
    });
  });
});
