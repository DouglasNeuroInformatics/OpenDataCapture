import { LoggingService } from '@douglasneuroinformatics/libnest';
import { MockFactory } from '@douglasneuroinformatics/libnest/testing';
import type { MockedInstance } from '@douglasneuroinformatics/libnest/testing';
import { Reflector } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import type { Permissions } from '@opendatacapture/schemas/core';
import type { Group } from '@opendatacapture/schemas/group';
import type { PermissionSetRule } from '@opendatacapture/schemas/permission-set';
import type { BasePermissionLevel } from '@opendatacapture/schemas/user';
import { beforeEach, describe, expect, it } from 'vitest';

import { AbilityFactory } from '@/auth/ability.factory';
import { createAppAbility } from '@/auth/ability.utils';
import { ROUTE_ACCESS_METADATA_KEY } from '@/core/decorators/route-access.decorator';
import type { ProtectedRoutePermissionSet } from '@/core/decorators/route-access.decorator';

import { PermissionSetsController } from '../permission-sets.controller';
import { PermissionSetsService } from '../permission-sets.service';

const ability = createAppAbility([{ action: 'manage', subject: 'all' }]);

const RULES: PermissionSetRule[] = [{ action: 'read', scope: 'HOLDER_GROUPS', subject: 'Subject' }];

describe('PermissionSetsController', () => {
  let permissionSetsController: PermissionSetsController;
  let permissionSetsService: MockedInstance<PermissionSetsService>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [PermissionSetsController],
      providers: [MockFactory.createForService(PermissionSetsService)]
    }).compile();
    permissionSetsController = moduleRef.get(PermissionSetsController);
    permissionSetsService = moduleRef.get(PermissionSetsService);
  });

  it('should pass a new set to the service as received, since the body is already validated', async () => {
    await permissionSetsController.create({ name: 'Research Assistant', rules: RULES });
    expect(permissionSetsService.create).toHaveBeenCalledWith({ name: 'Research Assistant', rules: RULES });
  });

  it('should forward the caller ability when listing sets, so the query is scoped', async () => {
    await permissionSetsController.findAll(ability);
    expect(permissionSetsService.findAll).toHaveBeenCalledWith({ ability });
  });

  it('should forward the caller ability when reading a set, so the query is scoped', async () => {
    await permissionSetsController.findById('set-1', ability);
    expect(permissionSetsService.findById).toHaveBeenCalledWith('set-1', { ability });
  });

  it('should forward the caller ability when updating a set, so the write is scoped', async () => {
    await permissionSetsController.updateById('set-1', { name: 'Renamed' }, ability);
    expect(permissionSetsService.updateById).toHaveBeenCalledWith('set-1', { name: 'Renamed' }, { ability });
  });

  it('should forward the caller ability when deleting a set, so the write is scoped', async () => {
    await permissionSetsController.deleteById('set-1', ability);
    expect(permissionSetsService.deleteById).toHaveBeenCalledWith('set-1', { ability });
  });

  // What `JwtAuthGuard` itself computes for each route: the declared access, evaluated against a whole
  // ability. Editing a set is a grant to each of its holders, so nothing short of an administrator may.
  describe('route access', () => {
    const HANDLERS = ['create', 'deleteById', 'findAll', 'findById', 'updateById'] as const;

    const abilityFor = (basePermissionLevel: BasePermissionLevel, additionalPermissions: Permissions = []) => {
      return new AbilityFactory(MockFactory.createMock(LoggingService) as unknown as LoggingService).createForPayload(
        {
          additionalPermissions,
          basePermissionLevel,
          firstName: 'Test',
          groups: [{ id: 'group-1' }] as Group[],
          id: 'user-1',
          kind: 'login',
          lastName: 'User',
          mustResetPassword: false,
          username: 'test-user'
        },
        []
      );
    };

    const declaredAccess = (handler: (typeof HANDLERS)[number]) => {
      return new Reflector().get<ProtectedRoutePermissionSet>(
        ROUTE_ACCESS_METADATA_KEY,
        Object.getOwnPropertyDescriptor(PermissionSetsController.prototype, handler)!.value
      );
    };

    it.each(HANDLERS)(
      'should refuse %s to a group manager granted every action but manage on everything, which a set may hold',
      (handler) => {
        const { action, subject } = declaredAccess(handler);
        const grantee = abilityFor(
          'GROUP_MANAGER',
          (['create', 'delete', 'read', 'update'] as const).map((action) => ({ action, groupId: null, subject: 'all' }))
        );
        expect(grantee.can(action, subject)).toBe(false);
      }
    );

    it.each(HANDLERS)('should allow %s to an administrator', (handler) => {
      const { action, subject } = declaredAccess(handler);
      expect(abilityFor('ADMIN').can(action, subject)).toBe(true);
    });
  });
});
