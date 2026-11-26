import { ConfigService } from '@douglasneuroinformatics/libnest';
import { JwtService } from '@nestjs/jwt';
import { INTERACTIVE_SIGN_IN_HEADER } from '@opendatacapture/schemas/auth';
import type { TokenPayload } from '@opendatacapture/schemas/auth';
import type { User } from '@opendatacapture/schemas/user';
import { beforeAll, describe, expect, it } from 'vitest';

import { REFRESH_REQUEST_THROTTLER_MEDIUM_LIMIT } from '@/core/constants';

import { defineSuite } from '../helpers';

const PASSWORD = 'DataCapture2025_Test';

const OTHER_PASSWORD = 'Another2025_Passphrase';

const HOUR = 3_600_000;

/**
 * Every request here arrives through the bundled Caddy from one client address of its own, so the
 * logins of this suite are counted apart from those of every other suite sharing the app.
 */
const VIA_CADDY = { headers: { 'x-forwarded-for': '203.0.113.110' }, remoteAddress: '172.18.0.5' };

type Claims = TokenPayload & { exp: number; iat: number };

export default defineSuite('token renewal', function () {
  let adminHeaders: { authorization: string };

  const login = (username: string, { interactive = false, password = PASSWORD } = {}) => {
    return this.app.inject({
      ...VIA_CADDY,
      headers: { ...VIA_CADDY.headers, ...(interactive ? { [INTERACTIVE_SIGN_IN_HEADER]: 'true' } : {}) },
      method: 'POST',
      payload: { password, username },
      url: '/v1/auth/login'
    });
  };

  const tokenFor = async (username: string, options?: Parameters<typeof login>[1]): Promise<string> => {
    const response = await login(username, options);
    expect(response.statusCode).toBe(200);
    return response.json<{ accessToken: string }>().accessToken;
  };

  const refresh = (accessToken: string, clientAddress = VIA_CADDY.headers['x-forwarded-for']) => {
    return this.app.inject({
      ...VIA_CADDY,
      headers: { authorization: `Bearer ${accessToken}`, 'x-forwarded-for': clientAddress },
      method: 'POST',
      url: '/v1/auth/refresh'
    });
  };

  const idleLimitInSeconds = () => this.app.get<ConfigService>(ConfigService).get('AUTH_IDLE_TIMEOUT_MINUTES') * 60;

  const claimsOf = (accessToken: string): Claims => {
    return JSON.parse(Buffer.from(accessToken.split('.')[1]!, 'base64url').toString()) as Claims;
  };

  /** A token the app itself signed, with claims no route of this release would issue. */
  const sign = (claims: Partial<Claims>): Promise<string> => {
    const { exp: _exp, iat: _iat, ...payload } = claims;
    return this.app.get(JwtService, { strict: false }).signAsync(payload, { expiresIn: '1h' });
  };

  const createUser = async (username: string, overrides: { [key: string]: unknown } = {}): Promise<User> => {
    const response = await this.app.inject({
      headers: adminHeaders,
      method: 'POST',
      payload: {
        basePermissionLevel: 'STANDARD',
        firstName: 'Renewal',
        groupIds: [],
        lastName: 'User',
        password: PASSWORD,
        username,
        ...overrides
      },
      url: '/v1/users'
    });
    expect(response.statusCode).toBe(201);
    return response.json<User>();
  };

  const updateUser = async (id: string, data: { [key: string]: unknown }): Promise<void> => {
    const response = await this.app.inject({
      headers: adminHeaders,
      method: 'PATCH',
      payload: data,
      url: `/v1/users/${id}`
    });
    expect(response.statusCode).toBe(200);
  };

  beforeAll(async () => {
    adminHeaders = { authorization: `Bearer ${await tokenFor('admin')}` };
  });

  describe('POST /v1/auth/login', () => {
    beforeAll(async () => {
      await createUser('renewal.login');
    });

    it('should answer a login without the header as it always has: one access token, good for an hour', async () => {
      const response = await login('renewal.login');
      expect(response.statusCode).toBe(200);
      expect(Object.keys(response.json())).toStrictEqual(['accessToken']);
      const { exp, iat, kind, username } = claimsOf(response.json<{ accessToken: string }>().accessToken);
      expect({ kind, lifetime: exp - iat, username }).toStrictEqual({
        kind: 'login',
        lifetime: 3600,
        username: 'renewal.login'
      });
    });

    it('should give an interactive login a token lasting the idle limit', async () => {
      const { exp, iat, renewal } = claimsOf(await tokenFor('renewal.login', { interactive: true }));
      expect(exp - iat).toBe(idleLimitInSeconds());
      expect(renewal?.isInteractive).toBe(true);
    });
  });

  describe('POST /v1/auth/refresh', () => {
    it('should renew an interactive token for the idle limit without moving the time its password was entered', async () => {
      await createUser('renewal.active');
      const accessToken = await tokenFor('renewal.active', { interactive: true });
      const response = await refresh(accessToken);
      expect(response.statusCode).toBe(200);
      expect(Object.keys(response.json())).toStrictEqual(['accessToken']);
      const renewed = claimsOf(response.json<{ accessToken: string }>().accessToken);
      expect(renewed.exp - renewed.iat).toBe(idleLimitInSeconds());
      expect(renewed.renewal).toStrictEqual(claimsOf(accessToken).renewal);
    });

    it('should renew a plain token for an hour, so a script that renews keeps the lifetime it signed in with', async () => {
      const response = await refresh(await tokenFor('renewal.active'));
      const renewed = claimsOf(response.json<{ accessToken: string }>().accessToken);
      expect(renewed.exp - renewed.iat).toBe(3600);
    });

    it('should sign the permissions the account holds now, so a change takes effect without signing in again', async () => {
      const user = await createUser('renewal.promoted');
      const accessToken = await tokenFor('renewal.promoted', { interactive: true });
      await updateUser(user.id, { basePermissionLevel: 'ADMIN' });
      const renewed = claimsOf((await refresh(accessToken)).json<{ accessToken: string }>().accessToken);
      expect(renewed.permissions).toStrictEqual([{ action: 'manage', subject: 'all' }]);
    });

    it('should renew a user whose own rules do not let them read themselves', async () => {
      await createUser('renewal.no-level', { basePermissionLevel: null });
      const response = await refresh(await tokenFor('renewal.no-level', { interactive: true }));
      expect(response.statusCode).toBe(200);
    });

    it('should refuse a token signed before renewal existed, which would otherwise never reach the absolute limit', async () => {
      const { renewal: _renewal, ...claims } = claimsOf(await tokenFor('renewal.active'));
      expect((await refresh(await sign(claims))).statusCode).toBe(401);
    });

    it('should refuse a token whose password was entered longer ago than the absolute limit', async () => {
      const claims = claimsOf(await tokenFor('renewal.active'));
      const authenticatedAt = Date.now() - 13 * HOUR;
      const accessToken = await sign({ ...claims, renewal: { ...claims.renewal!, authenticatedAt } });
      expect((await refresh(accessToken)).statusCode).toBe(401);
    });

    it('should refuse an instrument token, so the copy the playground holds cannot be kept alive', async () => {
      const response = await this.app.inject({
        ...VIA_CADDY,
        headers: { ...VIA_CADDY.headers, ...adminHeaders },
        method: 'GET',
        url: '/v1/auth/create-instrument-token'
      });
      expect(response.statusCode).toBe(200);
      expect((await refresh(response.json<{ accessToken: string }>().accessToken)).statusCode).toBe(403);
    });

    it('should refuse an expired token, so a tab left idle past its limit has to sign in again', async () => {
      const claims = claimsOf(await tokenFor('renewal.active'));
      const { exp: _exp, iat: _iat, ...payload } = claims;
      const expired = await this.app.get(JwtService, { strict: false }).signAsync(payload, { expiresIn: -1 });
      expect((await refresh(expired)).statusCode).toBe(401);
    });

    describe('after a password change', () => {
      let staleToken: string;
      let user: User;

      beforeAll(async () => {
        user = await createUser('renewal.rekeyed');
        staleToken = await tokenFor('renewal.rekeyed', { interactive: true });
        await updateUser(user.id, { password: OTHER_PASSWORD });
      });

      it('should refuse a token from before the change, so whoever held the old password cannot keep it alive', async () => {
        expect((await refresh(staleToken)).statusCode).toBe(401);
      });

      it('should renew a token from a sign-in with the new password', async () => {
        const accessToken = await tokenFor('renewal.rekeyed', { interactive: true, password: OTHER_PASSWORD });
        expect((await refresh(accessToken)).statusCode).toBe(200);
      });

      it('should leave the token generation out of what the API returns for the user, as it was before the field existed', async () => {
        const response = await this.app.inject({ headers: adminHeaders, method: 'GET', url: `/v1/users/${user.id}` });
        expect(response.statusCode).toBe(200);
        expect(response.json()).not.toHaveProperty('tokenGenerationId');
      });
    });

    describe('for an account disabled and then enabled again', () => {
      let staleToken: string;
      let user: User;

      beforeAll(async () => {
        user = await createUser('renewal.suspended');
        staleToken = await tokenFor('renewal.suspended', { interactive: true });
        await updateUser(user.id, { disabled: true });
      });

      it('should tell the holder the account is disabled while it is', async () => {
        const response = await refresh(staleToken);
        expect(response.statusCode).toBe(403);
        expect(response.json()).toMatchObject({ message: 'Account Disabled' });
      });

      it('should still refuse the old token once the account is enabled, so a suspension is not undone by lifting it', async () => {
        await updateUser(user.id, { disabled: false });
        expect((await refresh(staleToken)).statusCode).toBe(401);
        expect((await refresh(await tokenFor('renewal.suspended', { interactive: true }))).statusCode).toBe(200);
      });
    });

    it('should tell the holder of an archived account why their token is refused', async () => {
      const user = await createUser('renewal.archived');
      const accessToken = await tokenFor('renewal.archived', { interactive: true });
      const archive = await this.app.inject({
        headers: adminHeaders,
        method: 'PATCH',
        url: `/v1/users/${user.id}/archive`
      });
      expect(archive.statusCode).toBe(200);
      const response = await refresh(accessToken);
      expect(response.statusCode).toBe(403);
      expect(response.json()).toMatchObject({ message: 'Account Archived' });
    });

    describe('for a user who must reset their password', () => {
      let accessToken: string;
      let user: User;

      beforeAll(async () => {
        user = await createUser('renewal.must-reset', { mustResetPassword: true });
        accessToken = await tokenFor('renewal.must-reset', { interactive: true });
      });

      it('should keep the renewed token confined to the reset', async () => {
        const response = await refresh(accessToken);
        expect(response.statusCode).toBe(200);
        const { mustResetPassword, permissions } = claimsOf(response.json<{ accessToken: string }>().accessToken);
        expect(mustResetPassword).toBe(true);
        expect(permissions).toStrictEqual([{ action: 'read', conditions: { id: user.id }, subject: 'User' }]);
      });

      it('should refuse the token that performed the reset, so the user signs in with the password they chose', async () => {
        const reset = await this.app.inject({
          headers: { authorization: `Bearer ${accessToken}` },
          method: 'PATCH',
          payload: { password: OTHER_PASSWORD },
          url: `/v1/users/self-update/${user.id}`
        });
        expect(reset.statusCode).toBe(200);
        expect((await refresh(accessToken)).statusCode).toBe(401);
      });
    });

    it('should count renewals per user, so one user spending the limit does not stop another at the same address', async () => {
      // An address no other test renews from: the one-second limit is counted per address, and the
      // renewals above would otherwise be part of what this one spends.
      const sharedAddress = '203.0.113.111';
      await createUser('renewal.busy');
      const busyToken = await tokenFor('renewal.busy', { interactive: true });
      const statusCodes: number[] = [];
      while (statusCodes.at(-1) !== 429 && statusCodes.length <= REFRESH_REQUEST_THROTTLER_MEDIUM_LIMIT) {
        statusCodes.push((await refresh(busyToken, sharedAddress)).statusCode);
      }
      expect(statusCodes).toHaveLength(REFRESH_REQUEST_THROTTLER_MEDIUM_LIMIT + 1);
      expect(statusCodes.at(-1)).toBe(429);
      const otherToken = await tokenFor('renewal.login', { interactive: true });
      expect((await refresh(otherToken, sharedAddress)).statusCode).toBe(200);
    });
  });
});
