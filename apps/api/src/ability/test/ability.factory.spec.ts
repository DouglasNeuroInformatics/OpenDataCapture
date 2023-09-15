import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';

import { Test, TestingModule } from '@nestjs/testing';

import { AbilityFactory } from '../ability.factory.js';

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
      assert(ability.rules.length === 0);
    });

    it('should return a rule set with a single rule when the user has a basePermissionLevel of admin', () => {
      const ability = abilityFactory.createForUser({
        username: 'admin',
        password: 'Password123',
        groups: [],
        basePermissionLevel: 'ADMIN'
      });
      assert.deepStrictEqual(ability.rules, [{ action: 'manage', subject: 'all' }]);
    });
  });
});
