import { Test, TestingModule } from '@nestjs/testing';

import { PermissionsFactory } from '@/permissions/permissions.factory';

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

  describe('createDefaultPermissions', () => {
    it('should return an empty array when no level is provided', () => {
      expect(permissionsFactory.createDefaultPermissions()).toEqual([]);
    });

    it('should return an array with a single rule when level is admin', () => {
      expect(permissionsFactory.createDefaultPermissions('admin')).toEqual([
        {
          action: 'manage',
          subject: 'all'
        }
      ]);
    });
  });
});
