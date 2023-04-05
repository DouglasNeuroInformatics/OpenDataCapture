import { Test, TestingModule } from '@nestjs/testing';

import { BasePermissionLevel } from '@ddcp/common';

import { AbilityFactory } from '../ability.factory';

describe('AbilityFactory', () => {
  let abilityFactory: AbilityFactory;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AbilityFactory]
    }).compile();

    abilityFactory = module.get(AbilityFactory);
  });

  it('should be defined', () => {
    expect(abilityFactory).toBeDefined();
  });

  describe('createForUser', () => {
    it('should return an empty rule set when the user has no basePermissionLevel', () => {
      const ability = abilityFactory.createForUser({ username: 'user', password: 'Password123', groups: [] });
      expect(ability.rules).toEqual([]);
    });

    it('should return a rule set with a single rule when the user has a basePermissionLevel of admin', () => {
      const ability = abilityFactory.createForUser({
        username: 'admin',
        password: 'Password123',
        groups: [],
        basePermissionLevel: BasePermissionLevel.Admin
      });
      expect(ability.rules).toEqual([{ action: 'manage', subject: 'all' }]);
    });
  });
});
