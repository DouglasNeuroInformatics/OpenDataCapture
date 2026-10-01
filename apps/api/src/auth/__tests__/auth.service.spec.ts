import { CryptoService, LoggingService } from '@douglasneuroinformatics/libnest';
import type { RequestUser } from '@douglasneuroinformatics/libnest';
import { MockFactory } from '@douglasneuroinformatics/libnest/testing';
import type { MockedInstance } from '@douglasneuroinformatics/libnest/testing';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
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
  kind: 'login',
  lastName: 'User',
  username: 'test-user'
};

describe('AuthService', () => {
  let abilityFactory: AbilityFactory;
  let authService: AuthService;
  let cryptoService: MockedInstance<CryptoService>;
  let jwtService: MockedInstance<JwtService>;
  let usersService: MockedInstance<UsersService>;

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
    cryptoService = MockFactory.createMock(CryptoService);
    usersService = MockFactory.createMock(UsersService);
    authService = new AuthService(
      abilityFactory,
      MockFactory.createMock(AuditLogger) as unknown as AuditLogger,
      cryptoService as unknown as CryptoService,
      jwtService as unknown as JwtService,
      usersService as unknown as UsersService
    );
  });

  describe('login', () => {
    const credentials = { password: 'guess', username: 'test-user' };

    const storedUser = (status: { archivedAt?: Date; disabled?: boolean }) => ({
      ...BASE_PAYLOAD,
      basePermissionLevel: 'STANDARD',
      groups: [],
      hashedPassword: '__HASH__',
      ...status
    });

    it.each([{ archivedAt: new Date() }, { disabled: true }])(
      'should answer a wrong password for a %o account as invalid credentials, so a guess cannot reveal its status',
      async (status) => {
        usersService.findByUsername.mockResolvedValue(storedUser(status) as any);
        cryptoService.comparePassword.mockResolvedValue(false);
        await expect(authService.login(credentials)).rejects.toThrow(UnauthorizedException);
      }
    );

    it('should refuse an archived account once the password is proven', async () => {
      usersService.findByUsername.mockResolvedValue(storedUser({ archivedAt: new Date() }) as any);
      cryptoService.comparePassword.mockResolvedValue(true);
      await expect(authService.login(credentials)).rejects.toThrow('Account Archived');
    });

    it('should refuse a disabled account once the password is proven', async () => {
      usersService.findByUsername.mockResolvedValue(storedUser({ disabled: true }) as any);
      cryptoService.comparePassword.mockResolvedValue(true);
      await expect(authService.login(credentials)).rejects.toThrow('Account Disabled');
    });
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

    it('should mark the minted token as an instrument token, so the guard admits it only where an upload needs it', async () => {
      await authService.getCreateInstrumentToken(requestUserFor('ADMIN'));
      expect(jwtService.signAsync.mock.lastCall?.[0]).toMatchObject({ kind: 'instrument' });
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
