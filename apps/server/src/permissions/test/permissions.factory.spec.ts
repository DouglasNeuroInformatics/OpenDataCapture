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
});
