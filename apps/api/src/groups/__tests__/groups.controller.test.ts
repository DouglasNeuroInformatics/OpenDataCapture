import { LoggingService } from '@douglasneuroinformatics/libnest';
import { MockFactory } from '@douglasneuroinformatics/libnest/testing';
import type { MockedInstance } from '@douglasneuroinformatics/libnest/testing';
import { Reflector } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import type { Group } from '@opendatacapture/schemas/group';
import type { BasePermissionLevel } from '@opendatacapture/schemas/user';
import { beforeEach, describe, expect, it } from 'vitest';

import { AbilityFactory } from '@/auth/ability.factory';
import { createAppAbility } from '@/auth/ability.utils';
import { ROUTE_ACCESS_METADATA_KEY } from '@/core/decorators/route-access.decorator';
import type { ProtectedRoutePermissionSet } from '@/core/decorators/route-access.decorator';

import { GroupsController } from '../groups.controller';
import { GroupsService } from '../groups.service';

const createAbility = () => createAppAbility([{ action: 'read', subject: 'Group' }]);

describe('GroupsController', () => {
  let groupsController: GroupsController;
  let groupsService: MockedInstance<GroupsService>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [GroupsController],
      providers: [MockFactory.createForService(GroupsService)]
    }).compile();
    groupsController = moduleRef.get(GroupsController);
    groupsService = moduleRef.get(GroupsService);
  });

  it('should be defined', () => {
    expect(groupsController).toBeDefined();
  });

  describe('create', () => {
    it('should pass the provided object to the groups service', async () => {
      await groupsController.create({ name: 'Test Group', type: 'CLINICAL' });
      expect(groupsService.create.mock.lastCall?.[0]).toMatchObject({ name: 'Test Group' });
    });
  });

  describe('findAll', () => {
    it('should return the array returned by the groups service', async () => {
      groupsService.findAll.mockResolvedValueOnce([{ name: 'Test Group' }]);
      await expect(groupsController.findAll()).resolves.toMatchObject([{ name: 'Test Group' }]);
    });

    it("should scope the listing to the current user's ability", async () => {
      const ability = createAbility();
      await groupsController.findAll(ability);
      expect(groupsService.findAll).toHaveBeenCalledWith({ ability });
    });
  });

  // What `JwtAuthGuard` itself computes for this route: the declared access, evaluated against a
  // whole role's ability. A group manager's `manage Group` rule is conditioned on their own groups,
  // but the guard checks the subject type, for which CASL ignores conditions -- so the previous
  // `create Group` declaration admitted every group manager (#1468).
  describe('route access for create', () => {
    const abilityFor = (basePermissionLevel: BasePermissionLevel) =>
      new AbilityFactory(MockFactory.createMock(LoggingService) as unknown as LoggingService).createForPayload({
        basePermissionLevel,
        firstName: 'Test',
        groups: [{ id: 'group-1' }] as Group[],
        id: 'user-1',
        kind: 'login',
        lastName: 'User',
        // This suite is testing basePermissionLevel-driven access, not the forced-reset ability,
        // which would short-circuit every case below to `read User self` regardless of the role.
        mustResetPassword: false,
        username: 'test-user'
      });

    // `@RouteAccess` stores its metadata on the handler itself, which is what the guard reads
    // through `context.getHandler()`.
    const { action, subject } = new Reflector().get<ProtectedRoutePermissionSet>(
      ROUTE_ACCESS_METADATA_KEY,
      Object.getOwnPropertyDescriptor(GroupsController.prototype, 'create')!.value
    );

    it('should refuse a group manager, who may otherwise manage the groups they belong to', () => {
      expect(abilityFor('GROUP_MANAGER').can(action, subject)).toBe(false);
    });

    it('should refuse a standard user', () => {
      expect(abilityFor('STANDARD').can(action, subject)).toBe(false);
    });

    it('should allow an administrator', () => {
      expect(abilityFor('ADMIN').can(action, subject)).toBe(true);
    });
  });

  describe('findById', () => {
    it('should return the value provided by the groups service ', async () => {
      groupsService.findById.mockResolvedValueOnce({ name: 'Test Group' });
      await expect(groupsController.findById('123')).resolves.toMatchObject({
        name: 'Test Group'
      });
    });

    it("should scope the lookup to the current user's ability", async () => {
      const ability = createAbility();
      await groupsController.findById('123', ability);
      expect(groupsService.findById).toHaveBeenCalledWith('123', { ability });
    });
  });

  describe('deleteById', () => {
    it("should scope the deletion to the current user's ability", async () => {
      const ability = createAbility();
      await groupsController.deleteById('123', ability);
      expect(groupsService.deleteById).toHaveBeenCalledWith('123', { ability });
    });

    it('should return the group deleted by the groups service', async () => {
      groupsService.deleteById.mockResolvedValueOnce({ name: 'Test Group' });
      await expect(groupsController.deleteById('123')).resolves.toMatchObject({ name: 'Test Group' });
    });
  });

  describe('updateById', () => {
    it("should forward the update scoped to the current user's ability", async () => {
      const ability = createAbility();
      await groupsController.updateById('123', { name: 'Renamed Group' }, ability);
      expect(groupsService.updateById).toHaveBeenCalledWith('123', { name: 'Renamed Group' }, { ability });
    });

    it('should return the group updated by the groups service', async () => {
      groupsService.updateById.mockResolvedValueOnce({ name: 'Renamed Group' });
      await expect(groupsController.updateById('123', { name: 'Renamed Group' })).resolves.toMatchObject({
        name: 'Renamed Group'
      });
    });
  });
});
