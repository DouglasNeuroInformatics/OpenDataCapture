import { Test, TestingModule } from '@nestjs/testing';

import { beforeEach, describe, expect, it } from 'bun:test';

import { AbilityFactory } from '../ability.factory';

describe('AbilityFactory', () => {
  let abilityFactory: AbilityFactory;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AbilityFactory]
    }).compile();

    abilityFactory = module.get(AbilityFactory);
  });

  describe('createForUser', () => {
    it('should return an empty rule set when the user has no basePermissionLevel', () => {
      const ability = abilityFactory.createForUser({ username: 'user', password: 'Password123', groups: [] });
      expect(ability.rules).toBeArrayOfSize(0);
    });

    it('should return permission to manage all for an admin', () => {
      const ability = abilityFactory.createForUser({
        username: 'admin',
        password: 'Password123',
        groups: [],
        basePermissionLevel: 'ADMIN'
      });
      expect(ability.rules).toMatchObject([{ action: 'manage', subject: 'all' }]);
    });
  });
});
