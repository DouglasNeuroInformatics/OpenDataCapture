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

  it('should create an ability for a standard user that can update only itself', () => {
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

    expect(ability.can('update', subject('User', { id: 'user-1' }) as any)).toBe(true);
    expect(ability.can('update', subject('User', { id: 'user-2' }) as any)).toBe(false);
  });

  it('should not allow a standard user to modify its basePermissionLevel', () => {
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

    expect(ability.can('update', subject('User', { id: 'user-1' }) as any, 'basePermissionLevel')).toBe(false);
  });
});
