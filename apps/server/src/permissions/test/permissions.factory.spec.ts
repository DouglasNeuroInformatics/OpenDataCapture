import { Test, TestingModule } from '@nestjs/testing';

import { PermissionsFactory } from '@/permissions/permissions.factory';
import { BasePermissionLevel } from '@ddcp/common';

describe('PermissionsFactory', () => {
  let permissionsFactory: PermissionsFactory;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PermissionsFactory]
    }).compile();

    permissionsFactory = module.get(PermissionsFactory);
  });

  it('should be defined', () => {
    expect(permissionsFactory).toBeDefined();
  });

  describe('createForUser', () => {
    it('should return an empty rule set when the user has no basePermissionLevel', () => {
      const permissions = permissionsFactory.createForUser({ username: 'user', password: 'Password123', groups: [] });
      expect(permissions.rules).toEqual([]);
    });

    it('should return a rule set with a single rule when the user has a basePermissionLevel of admin', () => {
      const permissions = permissionsFactory.createForUser({
        username: 'admin',
        password: 'Password123',
        groups: [],
        basePermissionLevel: BasePermissionLevel.Admin
      });
      expect(permissions.rules).toEqual([{ action: 'manage', subject: 'all' }]);
    });
  });
});
