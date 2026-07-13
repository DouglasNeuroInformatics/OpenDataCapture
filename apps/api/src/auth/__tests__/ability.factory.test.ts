import { subject } from '@casl/ability';
import { LoggingService } from '@douglasneuroinformatics/libnest';
import { MockFactory } from '@douglasneuroinformatics/libnest/testing';
import type { MockedInstance } from '@douglasneuroinformatics/libnest/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { AbilityFactory } from '../ability.factory.js';

describe('AbilityFactory', () => {
  let abilityFactory: AbilityFactory;
  let loggingService: MockedInstance<LoggingService>;

  beforeEach(() => {
    loggingService = MockFactory.createMock(LoggingService);
    abilityFactory = new AbilityFactory(loggingService as unknown as LoggingService);
  });

  it('should allow admin to manage all', () => {
    const payload = {
      additionalPermissions: undefined,
      basePermissionLevel: 'ADMIN',
      firstName: 'Test',
      groups: [{ id: 'group-1' }],
      id: 'user-1',
      lastName: 'User',
      permissions: [] as any,
      username: 'admin-user'
    };

    const ability = abilityFactory.createForPayload(payload as any);

    expect(ability.can('manage', 'all')).toBe(true);
  });

  it('should allow group manager to manage their group', () => {
    const payload = {
      additionalPermissions: undefined,
      basePermissionLevel: 'GROUP_MANAGER',
      firstName: 'Test',
      groups: [{ id: 'group-1' }],
      id: 'user-1',
      lastName: 'User',
      permissions: [] as any,
      username: 'admin-user'
    };

    const ability = abilityFactory.createForPayload(payload as any);

    expect(ability.can('manage', subject('Group', { id: 'group-1' }) as any)).toBe(true);
    expect(ability.can('manage', subject('Group', { id: 'group-2' }) as any)).toBe(false);
  });

  it('should restrict series deletion to the manager group', () => {
    const ability = abilityFactory.createForPayload({
      additionalPermissions: undefined,
      basePermissionLevel: 'GROUP_MANAGER',
      firstName: 'Test',
      groups: [{ id: 'group-1' }],
      id: 'user-1',
      lastName: 'User',
      username: 'manager-user'
    } as any);

    expect(ability.can('delete', subject('Instrument', { seriesGroupId: 'group-1' }) as any)).toBe(true);
    expect(ability.can('delete', subject('Instrument', { seriesGroupId: 'group-2' }) as any)).toBe(false);
    expect(ability.can('delete', subject('Instrument', { seriesGroupId: null }) as any)).toBe(false);
    expect(ability.can('create', 'Instrument')).toBe(true);
    expect(ability.can('manage', 'Instrument')).toBe(false);
  });
  it('should allow standard user to read their own user info', () => {
    const payload = {
      additionalPermissions: undefined,
      basePermissionLevel: 'STANDARD',
      firstName: 'Test',
      groups: [{ id: 'group-1' }],
      id: 'user-1',
      lastName: 'User',
      permissions: [] as any,
      username: 'standard-user'
    };

    const ability = abilityFactory.createForPayload(payload as any);

    expect(ability.can('read', subject('User', { id: 'user-1' }) as any)).toBe(true);
    expect(ability.can('read', subject('User', { id: 'user-2' }) as any)).toBe(false);
  });

  it('should scope standard user instrument record file uploads to their groups', () => {
    const payload = {
      additionalPermissions: undefined,
      basePermissionLevel: 'STANDARD',
      firstName: 'Test',
      groups: [{ id: 'group-1' }],
      id: 'user-1',
      lastName: 'User',
      permissions: [] as any,
      username: 'standard-user'
    };

    const ability = abilityFactory.createForPayload(payload as any);

    expect(ability.can('create', subject('InstrumentRecordFile', { groupId: 'group-1' }) as any)).toBe(true);
    expect(ability.can('create', subject('InstrumentRecordFile', { groupId: 'group-2' }) as any)).toBe(false);
    expect(ability.can('read', subject('InstrumentRecordFile', { groupId: 'group-1' }) as any)).toBe(false);
  });

  it('should scope group manager instrument record file uploads to their groups', () => {
    const payload = {
      additionalPermissions: undefined,
      basePermissionLevel: 'GROUP_MANAGER',
      firstName: 'Test',
      groups: [{ id: 'group-1' }],
      id: 'user-1',
      lastName: 'User',
      permissions: [] as any,
      username: 'manager-user'
    };

    const ability = abilityFactory.createForPayload(payload as any);

    expect(ability.can('create', subject('InstrumentRecordFile', { groupId: 'group-1' }) as any)).toBe(true);
    expect(ability.can('create', subject('InstrumentRecordFile', { groupId: 'group-2' }) as any)).toBe(false);
  });
});
