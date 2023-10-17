import { beforeEach, describe, expect, it } from 'bun:test';

import { Test, TestingModule } from '@nestjs/testing';

import { AbilityFactory } from '../ability.factory';

describe('AbilityFactory', () => {
  let abilityFactory: AbilityFactory;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AbilityFactory]
    }).compile();

    abilityFactory = await module.resolve(AbilityFactory);
  });

  describe('createForUser', () => {
    it('should return an empty rule set when the user has no basePermissionLevel', () => {
      const ability = abilityFactory.createForUser({ groups: [], password: 'Password123', username: 'user' });
      expect(ability.rules).toBeArrayOfSize(0);
    });

    it('should return permission to manage all for an admin', () => {
      const ability = abilityFactory.createForUser({
        basePermissionLevel: 'ADMIN',
        groups: [],
        password: 'Password123',
        username: 'admin'
      });
      expect(ability.rules).toMatchObject([{ action: 'manage', subject: 'all' }]);
    });
  });
});
