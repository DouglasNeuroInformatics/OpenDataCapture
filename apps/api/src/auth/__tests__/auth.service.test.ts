import { ConfigService, CryptoService, LoggingService } from '@douglasneuroinformatics/libnest';
import type { RequestUser } from '@douglasneuroinformatics/libnest';
import { MockFactory } from '@douglasneuroinformatics/libnest/testing';
import type { MockedInstance } from '@douglasneuroinformatics/libnest/testing';
import { ForbiddenException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { TokenPayload, TokenRenewal } from '@opendatacapture/schemas/auth';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AuditLogger } from '@/audit/audit.logger';
import { UsersService } from '@/users/users.service';

import { AbilityFactory } from '../ability.factory.js';
import { createAppAbility, forcedAppSubject } from '../ability.utils.js';
import { AuthService } from '../auth.service.js';

import type { Permission } from '../auth.types.js';

/** The base payload `login` signs, minus the permission level each test supplies. */
type StoredUser = Awaited<ReturnType<UsersService['findByUsername']>>;

type TokenHolder = Awaited<ReturnType<UsersService['findTokenHolder']>>;

const MINUTE = 60_000;

const HOUR = 60 * MINUTE;

const NOW = new Date('2026-06-01T12:00:00.000Z').getTime();

const ENV = { AUTH_ABSOLUTE_TIMEOUT_HOURS: 12, AUTH_IDLE_TIMEOUT_MINUTES: 15 };

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
  let auditLogger: MockedInstance<AuditLogger>;
  let authService: AuthService;
  let configService: MockedInstance<ConfigService>;
  let cryptoService: MockedInstance<CryptoService>;
  let jwtService: MockedInstance<JwtService>;
  let usersService: MockedInstance<UsersService>;

  const requestUserFor = (basePermissionLevel: 'ADMIN' | 'GROUP_MANAGER' | 'STANDARD'): RequestUser => {
    const ability = abilityFactory.createForPayload({ ...BASE_PAYLOAD, basePermissionLevel } as any, []);
    return { ...BASE_PAYLOAD, ability, basePermissionLevel } as unknown as RequestUser;
  };

  /** The permissions the minted token actually carries, read back off the signed payload. */
  const mintedPermissions = async (currentUser: RequestUser): Promise<Permission[]> => {
    await authService.getCreateInstrumentToken(currentUser);
    const [payload] = jwtService.signAsync.mock.lastCall ?? [];
    return (payload as { permissions: Permission[] }).permissions;
  };

  beforeEach(() => {
    abilityFactory = new AbilityFactory(MockFactory.createMock(LoggingService) as unknown as LoggingService);
    jwtService = MockFactory.createMock(JwtService);
    jwtService.signAsync.mockResolvedValue('__TOKEN__');
    cryptoService = MockFactory.createMock(CryptoService);
    usersService = MockFactory.createMock(UsersService);
    auditLogger = MockFactory.createMock(AuditLogger);
    configService = MockFactory.createMock(ConfigService);
    configService.get.mockImplementation((key: keyof typeof ENV) => ENV[key]);
    vi.useFakeTimers({ now: NOW });
    authService = new AuthService(
      abilityFactory,
      auditLogger as unknown as AuditLogger,
      configService as unknown as ConfigService,
      cryptoService as unknown as CryptoService,
      jwtService as unknown as JwtService,
      usersService as unknown as UsersService
    );
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  /** The payload and signing options of the token most recently signed. */
  const lastSigned = () => {
    const [payload, options] = jwtService.signAsync.mock.lastCall ?? [];
    return { options, payload: payload as TokenPayload };
  };

  describe('login', () => {
    const credentials = { password: 'guess', username: 'test-user' };

    const PLAIN = { isInteractive: false };

    const INTERACTIVE = { isInteractive: true };

    const storedUser = (overrides: Partial<StoredUser> = {}): StoredUser => ({
      __modelName: 'User',
      additionalPermissions: [],
      archivedAt: null,
      basePermissionLevel: 'STANDARD',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      dateOfBirth: null,
      disabled: null,
      email: null,
      firstName: 'Test',
      groupIds: [],
      groups: [],
      hashedPassword: '__HASH__',
      id: 'user-1',
      lastName: 'User',
      mustResetPassword: null,
      permissionSet: null,
      permissionSetId: null,
      phoneNumber: null,
      sex: null,
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      username: 'test-user',
      ...overrides
    });

    it.each([{ archivedAt: new Date() }, { disabled: true }])(
      'should answer a wrong password for a %o account as invalid credentials, so a guess cannot reveal its status',
      async (status) => {
        usersService.findByUsername.mockResolvedValue(storedUser(status));
        cryptoService.comparePassword.mockResolvedValue(false);
        await expect(authService.login(credentials, PLAIN)).rejects.toThrow(UnauthorizedException);
      }
    );

    it('should refuse an archived account once the password is proven', async () => {
      usersService.findByUsername.mockResolvedValue(storedUser({ archivedAt: new Date() }));
      cryptoService.comparePassword.mockResolvedValue(true);
      await expect(authService.login(credentials, PLAIN)).rejects.toThrow('Account Archived');
    });

    it('should refuse a disabled account once the password is proven', async () => {
      usersService.findByUsername.mockResolvedValue(storedUser({ disabled: true }));
      cryptoService.comparePassword.mockResolvedValue(true);
      await expect(authService.login(credentials, PLAIN)).rejects.toThrow('Account Disabled');
    });

    it('should answer an unknown username as invalid credentials, so a guess cannot reveal which usernames exist', async () => {
      usersService.findByUsername.mockRejectedValue(new NotFoundException());
      await expect(authService.login(credentials, PLAIN)).rejects.toThrow(
        new UnauthorizedException('Invalid Credentials')
      );
    });

    it('should let an unexpected lookup failure propagate rather than disguise it as bad credentials', async () => {
      const failure = new Error('database unreachable');
      usersService.findByUsername.mockRejectedValue(failure);
      await expect(authService.login(credentials, PLAIN)).rejects.toBe(failure);
    });

    it('should return the signed token once the password is proven for an active account', async () => {
      usersService.findByUsername.mockResolvedValue(storedUser());
      cryptoService.comparePassword.mockResolvedValue(true);
      await expect(authService.login(credentials, PLAIN)).resolves.toStrictEqual({ accessToken: '__TOKEN__' });
    });

    it('should sign a login token carrying the permissions derived from the account, so the guard needs no lookup', async () => {
      usersService.findByUsername.mockResolvedValue(storedUser());
      cryptoService.comparePassword.mockResolvedValue(true);
      await authService.login(credentials, PLAIN);
      expect(jwtService.signAsync.mock.lastCall?.[0]).toMatchObject({
        id: 'user-1',
        kind: 'login',
        permissions: expect.arrayContaining([expect.objectContaining({ action: 'read', subject: 'Instrument' })]),
        username: 'test-user'
      });
    });

    it("should sign the rules of the user's permission set, confined to the user's groups where the set says so", async () => {
      usersService.findByUsername.mockResolvedValue(
        storedUser({
          groups: [{ id: 'group-1' } as StoredUser['groups'][number]],
          permissionSet: {
            __modelName: 'PermissionSet',
            createdAt: new Date('2026-01-01T00:00:00.000Z'),
            id: 'set-1',
            name: 'Research Assistant',
            rules: [{ action: 'read', scope: 'HOLDER_GROUPS', subject: 'InstrumentRecord' }],
            updatedAt: new Date('2026-01-01T00:00:00.000Z')
          },
          permissionSetId: 'set-1'
        })
      );
      cryptoService.comparePassword.mockResolvedValue(true);
      await authService.login(credentials, PLAIN);
      expect(jwtService.signAsync.mock.lastCall?.[0]).toMatchObject({
        permissions: expect.arrayContaining([
          { action: 'read', conditions: { groupId: { in: ['group-1'] } }, subject: 'InstrumentRecord' }
        ])
      });
    });

    describe('with an archived group', () => {
      const activeGroup = { archivedAt: null, id: 'group-1' } as StoredUser['groups'][number];
      const archivedGroup = { archivedAt: new Date(), id: 'group-2' } as StoredUser['groups'][number];

      const signedPayload = async (overrides: Partial<StoredUser>) => {
        usersService.findByUsername.mockResolvedValue(
          storedUser({ basePermissionLevel: 'GROUP_MANAGER', groups: [activeGroup, archivedGroup], ...overrides })
        );
        cryptoService.comparePassword.mockResolvedValue(true);
        await authService.login(credentials, PLAIN);
        return jwtService.signAsync.mock.lastCall?.[0] as Pick<TokenPayload, 'additionalPermissions' | 'groups'> & {
          permissions: Permission[];
        };
      };

      it('should leave the archived group off the token, so it cannot be selected as the current group', async () => {
        const { groups } = await signedPayload({});
        expect(groups).toStrictEqual([activeGroup]);
      });

      it('should confine the rules the base level derives from groups to the active ones', async () => {
        const ability = createAppAbility((await signedPayload({})).permissions);
        expect(ability.can('read', forcedAppSubject('InstrumentRecord', { groupId: 'group-1' }))).toBe(true);
        expect(ability.can('read', forcedAppSubject('InstrumentRecord', { groupId: 'group-2' }))).toBe(false);
      });

      it("should drop a grant confined to the archived group, which would otherwise keep reading that group's rows", async () => {
        const { additionalPermissions, permissions } = await signedPayload({
          additionalPermissions: [
            { action: 'read', groupId: 'group-1', subject: 'Session' },
            { action: 'read', groupId: 'group-2', subject: 'Session' },
            { action: 'read', groupId: null, subject: 'Subject' }
          ],
          basePermissionLevel: null
        });
        expect(additionalPermissions).toStrictEqual([
          { action: 'read', groupId: 'group-1', subject: 'Session' },
          { action: 'read', groupId: null, subject: 'Subject' }
        ]);
        const ability = createAppAbility(permissions);
        expect(ability.can('read', forcedAppSubject('Session', { groupId: 'group-1' }))).toBe(true);
        expect(ability.can('read', forcedAppSubject('Session', { groupId: 'group-2' }))).toBe(false);
      });

      it("should confine a permission set's rules for the holder's groups to the active ones", async () => {
        const { permissions } = await signedPayload({
          basePermissionLevel: null,
          permissionSet: {
            __modelName: 'PermissionSet',
            createdAt: new Date('2026-01-01T00:00:00.000Z'),
            id: 'set-1',
            name: 'Research Assistant',
            rules: [{ action: 'read', scope: 'HOLDER_GROUPS', subject: 'InstrumentRecord' }],
            updatedAt: new Date('2026-01-01T00:00:00.000Z')
          },
          permissionSetId: 'set-1'
        });
        expect(permissions).toStrictEqual([
          { action: 'read', conditions: { groupId: { in: ['group-1'] } }, subject: 'InstrumentRecord' }
        ]);
      });
    });

    it('should leave the permission set itself off the signed payload, so it does not grow the token', async () => {
      usersService.findByUsername.mockResolvedValue(
        storedUser({
          permissionSet: {
            __modelName: 'PermissionSet',
            createdAt: new Date('2026-01-01T00:00:00.000Z'),
            id: 'set-1',
            name: 'Research Assistant',
            rules: [{ action: 'read', scope: 'ALL_GROUPS', subject: 'Subject' }],
            updatedAt: new Date('2026-01-01T00:00:00.000Z')
          },
          permissionSetId: 'set-1'
        })
      );
      cryptoService.comparePassword.mockResolvedValue(true);
      await authService.login(credentials, PLAIN);
      const signed = jwtService.signAsync.mock.lastCall?.[0] as object;
      expect(signed).not.toHaveProperty('permissionSet');
      expect(signed).not.toHaveProperty('permissionSetId');
    });

    it('should treat an account with no reset flag as not needing a reset, since older accounts never stored one', async () => {
      usersService.findByUsername.mockResolvedValue(storedUser());
      cryptoService.comparePassword.mockResolvedValue(true);
      await authService.login(credentials, PLAIN);
      expect(jwtService.signAsync.mock.lastCall?.[0]).toMatchObject({ mustResetPassword: false });
    });

    it('should carry a pending password reset on the token, so the web client can force the reset', async () => {
      usersService.findByUsername.mockResolvedValue(storedUser({ mustResetPassword: true }));
      cryptoService.comparePassword.mockResolvedValue(true);
      await authService.login(credentials, PLAIN);
      expect(jwtService.signAsync.mock.lastCall?.[0]).toMatchObject({ mustResetPassword: true });
    });

    it('should record the login in the audit log under the user, outside any group', async () => {
      usersService.findByUsername.mockResolvedValue(storedUser());
      cryptoService.comparePassword.mockResolvedValue(true);
      await authService.login(credentials, PLAIN);
      expect(auditLogger.log).toHaveBeenCalledExactlyOnceWith('LOGIN', 'USER', { groupId: null, userId: 'user-1' });
    });

    it('should not record a login in the audit log when the password is wrong', async () => {
      usersService.findByUsername.mockResolvedValue(storedUser());
      cryptoService.comparePassword.mockResolvedValue(false);
      await expect(authService.login(credentials, PLAIN)).rejects.toThrow(UnauthorizedException);
      expect(auditLogger.log).not.toHaveBeenCalled();
    });

    it('should sign a plain login for exactly one hour, so nothing changes for a client that never renews', async () => {
      usersService.findByUsername.mockResolvedValue(storedUser());
      cryptoService.comparePassword.mockResolvedValue(true);
      await authService.login(credentials, PLAIN);
      expect(lastSigned().options).toStrictEqual({ expiresIn: 3600 });
    });

    it('should sign an interactive login for the idle limit, so an unattended tab stops working that soon', async () => {
      usersService.findByUsername.mockResolvedValue(storedUser());
      cryptoService.comparePassword.mockResolvedValue(true);
      await authService.login(credentials, INTERACTIVE);
      expect(lastSigned().options).toStrictEqual({ expiresIn: 15 * 60 });
    });

    it.each([PLAIN, INTERACTIVE])(
      'should record on a %o token when the password was entered and when the sign-in ends, so a renewal can enforce both',
      async (options) => {
        usersService.findByUsername.mockResolvedValue(storedUser());
        cryptoService.comparePassword.mockResolvedValue(true);
        await authService.login(credentials, options);
        expect(lastSigned().payload.renewal).toStrictEqual({
          authenticatedAt: NOW,
          endsAt: NOW + 12 * HOUR,
          isInteractive: options.isInteractive
        });
      }
    );

    it('should take the time of entry before the user is read, so a password changed during the check still cuts the token off', async () => {
      usersService.findByUsername.mockImplementation(() => {
        vi.advanceTimersByTime(5000);
        return Promise.resolve(storedUser());
      });
      cryptoService.comparePassword.mockResolvedValue(true);
      await authService.login(credentials, PLAIN);
      expect(lastSigned().payload.renewal?.authenticatedAt).toBe(NOW);
    });

    it('should cut the token short where the sign-in ends, so no token outlives the absolute limit', async () => {
      configService.get.mockImplementation(
        (key: keyof typeof ENV) => ({ ...ENV, AUTH_ABSOLUTE_TIMEOUT_HOURS: 1 })[key]
      );
      usersService.findByUsername.mockImplementation(() => {
        vi.advanceTimersByTime(5000);
        return Promise.resolve(storedUser());
      });
      cryptoService.comparePassword.mockResolvedValue(true);
      await authService.login(credentials, PLAIN);
      expect(lastSigned().options).toStrictEqual({ expiresIn: 3595 });
    });
  });

  describe('refresh', () => {
    const tokenHolder = (overrides: Partial<TokenHolder> = {}): TokenHolder => ({
      __modelName: 'User',
      additionalPermissions: [],
      archivedAt: null,
      basePermissionLevel: 'STANDARD',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      dateOfBirth: null,
      disabled: null,
      email: null,
      firstName: 'Test',
      groupIds: [],
      groups: [],
      id: 'user-1',
      lastName: 'User',
      mustResetPassword: null,
      permissionSet: null,
      permissionSetId: null,
      phoneNumber: null,
      sex: null,
      tokensValidAfter: null,
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      username: 'test-user',
      ...overrides
    });

    /** A user holding a token whose password was entered `age` milliseconds ago. */
    const currentUser = (age: number, renewal: Partial<TokenRenewal> = {}): RequestUser => ({
      ...requestUserFor('STANDARD'),
      renewal: { authenticatedAt: NOW - age, endsAt: NOW - age + 12 * HOUR, isInteractive: true, ...renewal }
    });

    it('should return a newly signed token for a holder still entitled to one', async () => {
      usersService.findTokenHolder.mockResolvedValue(tokenHolder());
      await expect(authService.refresh(currentUser(HOUR))).resolves.toStrictEqual({ accessToken: '__TOKEN__' });
    });

    it('should read the holder by the id on the token, so a renewal cannot be issued for anyone else', async () => {
      usersService.findTokenHolder.mockResolvedValue(tokenHolder());
      await authService.refresh(currentUser(HOUR));
      expect(usersService.findTokenHolder).toHaveBeenCalledExactlyOnceWith('user-1');
    });

    it('should refuse a token signed before renewal existed, which would otherwise never reach the absolute limit', async () => {
      await expect(authService.refresh(requestUserFor('STANDARD'))).rejects.toThrow(UnauthorizedException);
      expect(usersService.findTokenHolder).not.toHaveBeenCalled();
    });

    it('should refuse a token whose holder no longer exists', async () => {
      usersService.findTokenHolder.mockRejectedValue(new NotFoundException());
      await expect(authService.refresh(currentUser(HOUR))).rejects.toThrow(UnauthorizedException);
    });

    it('should let an unexpected lookup failure propagate rather than end the sign-in over it', async () => {
      const failure = new Error('database unreachable');
      usersService.findTokenHolder.mockRejectedValue(failure);
      await expect(authService.refresh(currentUser(HOUR))).rejects.toBe(failure);
    });

    it('should tell the holder of an archived account why, as login does', async () => {
      usersService.findTokenHolder.mockResolvedValue(tokenHolder({ archivedAt: new Date(NOW) }));
      await expect(authService.refresh(currentUser(HOUR))).rejects.toThrow(new ForbiddenException('Account Archived'));
    });

    it('should tell the holder of a disabled account why, even though disabling also sets the cut-off', async () => {
      usersService.findTokenHolder.mockResolvedValue(tokenHolder({ disabled: true, tokensValidAfter: new Date(NOW) }));
      await expect(authService.refresh(currentUser(HOUR))).rejects.toThrow(new ForbiddenException('Account Disabled'));
    });

    it.each([0, MINUTE])(
      'should refuse a password entered %d ms before the cut-off, so a token from before a password change cannot be kept alive',
      async (margin) => {
        usersService.findTokenHolder.mockResolvedValue(
          tokenHolder({ tokensValidAfter: new Date(NOW - HOUR + margin) })
        );
        await expect(authService.refresh(currentUser(HOUR))).rejects.toThrow(UnauthorizedException);
        expect(jwtService.signAsync).not.toHaveBeenCalled();
      }
    );

    it('should renew a token whose password was entered after the cut-off, so signing in again restores renewal', async () => {
      usersService.findTokenHolder.mockResolvedValue(tokenHolder({ tokensValidAfter: new Date(NOW - HOUR - 1) }));
      await expect(authService.refresh(currentUser(HOUR))).resolves.toStrictEqual({ accessToken: '__TOKEN__' });
    });

    it.each([12 * HOUR, 13 * HOUR])(
      'should refuse a token whose password was entered %d ms ago, at or past the absolute limit',
      async (age) => {
        usersService.findTokenHolder.mockResolvedValue(tokenHolder());
        await expect(authService.refresh(currentUser(age))).rejects.toThrow(UnauthorizedException);
      }
    );

    it('should measure the absolute limit from the configured value, not from the end the token claims', async () => {
      usersService.findTokenHolder.mockResolvedValue(tokenHolder());
      await expect(authService.refresh(currentUser(13 * HOUR, { endsAt: NOW + HOUR }))).rejects.toThrow(
        UnauthorizedException
      );
    });

    it('should carry the time of entry forward unchanged, so renewing never moves the absolute limit', async () => {
      usersService.findTokenHolder.mockResolvedValue(tokenHolder());
      await authService.refresh(currentUser(HOUR));
      expect(lastSigned().payload.renewal).toStrictEqual({
        authenticatedAt: NOW - HOUR,
        endsAt: NOW + 11 * HOUR,
        isInteractive: true
      });
    });

    it('should renew an interactive token for the idle limit', async () => {
      usersService.findTokenHolder.mockResolvedValue(tokenHolder());
      await authService.refresh(currentUser(HOUR));
      expect(lastSigned().options).toStrictEqual({ expiresIn: 15 * 60 });
    });

    it('should renew a plain token for an hour, so a script that renews keeps the lifetime it signed in with', async () => {
      usersService.findTokenHolder.mockResolvedValue(tokenHolder());
      await authService.refresh(currentUser(HOUR, { isInteractive: false }));
      expect(lastSigned().options).toStrictEqual({ expiresIn: 3600 });
      expect(lastSigned().payload.renewal?.isInteractive).toBe(false);
    });

    it('should cut the last renewal short at the absolute limit', async () => {
      usersService.findTokenHolder.mockResolvedValue(tokenHolder());
      await authService.refresh(currentUser(12 * HOUR - 5 * MINUTE));
      expect(lastSigned().options).toStrictEqual({ expiresIn: 5 * 60 });
    });

    it('should sign the permissions the account holds now, so a change takes effect without signing in again', async () => {
      usersService.findTokenHolder.mockResolvedValue(tokenHolder({ basePermissionLevel: 'ADMIN' }));
      await authService.refresh(currentUser(HOUR));
      expect(lastSigned().payload).toMatchObject({
        basePermissionLevel: 'ADMIN',
        kind: 'login',
        permissions: [{ action: 'manage', subject: 'all' }]
      });
    });

    it('should keep a holder who must reset their password confined to the reset', async () => {
      usersService.findTokenHolder.mockResolvedValue(tokenHolder({ mustResetPassword: true }));
      await authService.refresh(currentUser(HOUR));
      expect(lastSigned().payload).toMatchObject({
        mustResetPassword: true,
        permissions: [{ action: 'read', conditions: { id: 'user-1' }, subject: 'User' }]
      });
    });

    it('should not record a renewal in the audit log, which holds one entry per password entered', async () => {
      usersService.findTokenHolder.mockResolvedValue(tokenHolder());
      await authService.refresh(currentUser(HOUR));
      expect(auditLogger.log).not.toHaveBeenCalled();
    });
  });

  describe('getCreateInstrumentToken', () => {
    it('should mint a token lasting an hour for a login token that records no end to its sign-in', async () => {
      await authService.getCreateInstrumentToken(requestUserFor('ADMIN'));
      expect(lastSigned().options).toStrictEqual({ expiresIn: 3600 });
    });

    it('should cut the minted token short where the sign-in ends, so it cannot upload code past the absolute limit', async () => {
      const renewal = {
        authenticatedAt: NOW - 12 * HOUR + 10 * MINUTE,
        endsAt: NOW + 10 * MINUTE,
        isInteractive: true
      };
      await authService.getCreateInstrumentToken({ ...requestUserFor('ADMIN'), renewal });
      expect(lastSigned().options).toStrictEqual({ expiresIn: 10 * 60 });
    });

    it('should mint an already expired token for a sign-in that has ended, which only a server ignoring expiry lets this far', async () => {
      const renewal = { authenticatedAt: NOW - 13 * HOUR, endsAt: NOW - HOUR, isInteractive: true };
      await authService.getCreateInstrumentToken({ ...requestUserFor('ADMIN'), renewal });
      expect(lastSigned().options).toStrictEqual({ expiresIn: 0 });
    });

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
