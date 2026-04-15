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

  it('should allow group manager to manage group', () => {
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
  });
});
