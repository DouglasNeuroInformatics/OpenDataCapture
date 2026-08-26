import { CryptoService, LoggingService } from '@douglasneuroinformatics/libnest';
import type { RequestUser } from '@douglasneuroinformatics/libnest';
import { MockFactory } from '@douglasneuroinformatics/libnest/testing';
import type { MockedInstance } from '@douglasneuroinformatics/libnest/testing';
import { ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { beforeEach, describe, expect, it } from 'vitest';

import { AuditLogger } from '@/audit/audit.logger';
import { UsersService } from '@/users/users.service';

import { AbilityFactory } from '../ability.factory.js';
import { createAppAbility } from '../ability.utils.js';
import { AuthService } from '../auth.service.js';

import type { Permission } from '../auth.types.js';

/** The base payload `login` signs, minus the permission level each test supplies. */
const BASE_PAYLOAD = {
  additionalPermissions: undefined,
  firstName: 'Test',
  groups: [{ id: 'group-1' }],
  id: 'user-1',
  lastName: 'User',
  username: 'test-user'
};

describe('AuthService', () => {
  let abilityFactory: AbilityFactory;
  let authService: AuthService;
  let jwtService: MockedInstance<JwtService>;

  const requestUserFor = (basePermissionLevel: 'ADMIN' | 'GROUP_MANAGER' | 'STANDARD'): RequestUser => {
    const ability = abilityFactory.createForPayload({ ...BASE_PAYLOAD, basePermissionLevel } as any);
    return { ...BASE_PAYLOAD, ability, basePermissionLevel } as unknown as RequestUser;
  };

  /** The permissions the minted token actually carries, read back off the signed payload. */
  const mintedPermissions = async (currentUser: RequestUser): Promise<Permission[]> => {
    await authService.getCreateInstrumentToken(currentUser);
    return (jwtService.signAsync.mock.lastCall?.[0] as { permissions: Permission[] }).permissions;
  };

  beforeEach(() => {
    abilityFactory = new AbilityFactory(MockFactory.createMock(LoggingService) as unknown as LoggingService);
    jwtService = MockFactory.createMock(JwtService);
    jwtService.signAsync.mockResolvedValue('__TOKEN__');
    authService = new AuthService(
      abilityFactory,
      MockFactory.createMock(AuditLogger) as unknown as AuditLogger,
      MockFactory.createMock(CryptoService) as unknown as CryptoService,
      jwtService as unknown as JwtService,
      MockFactory.createMock(UsersService) as unknown as UsersService
    );
  });

  describe('getCreateInstrumentToken', () => {
    it('should mint a token that satisfies the instrument create route, so the playground can upload a bundle', async () => {
      const ability = createAppAbility(await mintedPermissions(requestUserFor('ADMIN')));
      expect(ability.can('manage', 'Instrument')).toBe(true);
    });

    it('should mint a token that grants nothing beyond instruments, since it travels outside the app', async () => {
      const ability = createAppAbility(await mintedPermissions(requestUserFor('ADMIN')));
      expect(ability.can('manage', 'all')).toBe(false);
      expect(ability.can('read', 'Subject')).toBe(false);
      expect(ability.can('read', 'InstrumentRecord')).toBe(false);
    });

    it('should refuse a group manager, whose create grant covers series instruments rather than arbitrary bundles', async () => {
      await expect(authService.getCreateInstrumentToken(requestUserFor('GROUP_MANAGER'))).rejects.toThrow(
        ForbiddenException
      );
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('should refuse a standard user, who may not create instruments at all', async () => {
      await expect(authService.getCreateInstrumentToken(requestUserFor('STANDARD'))).rejects.toThrow(
        ForbiddenException
      );
    });
  });
});
