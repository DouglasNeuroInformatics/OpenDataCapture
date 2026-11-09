import { CryptoService, PRISMA_CLIENT_TOKEN } from '@douglasneuroinformatics/libnest';
import { beforeAll, describe, expect, it } from 'vitest';

import type { RuntimePrismaClient } from '@/core/prisma';

import { defineSuite } from '../helpers';

const PASSWORD = 'DataCapture2025_Test';

const OTHER_PASSWORD = 'Another2025_Passphrase';

export default defineSuite('username case', function () {
  let adminHeaders: { authorization: string };

  const login = (username: string, password = PASSWORD) => {
    return this.app.inject({ method: 'POST', payload: { password, username }, url: '/v1/auth/login' });
  };

  const createUser = (username: string) => {
    return this.app.inject({
      headers: adminHeaders,
      method: 'POST',
      payload: {
        basePermissionLevel: 'ADMIN',
        firstName: 'Case',
        groupIds: [],
        lastName: 'User',
        password: PASSWORD,
        username
      },
      url: '/v1/users'
    });
  };

  /** Writes past the API, as an instance did before usernames ignored case. */
  const insertLegacyUser = async (username: string, password: string) => {
    await this.app.get<RuntimePrismaClient>(PRISMA_CLIENT_TOKEN).user.create({
      data: {
        additionalPermissions: [],
        basePermissionLevel: 'ADMIN',
        firstName: 'Legacy',
        hashedPassword: await this.app.get(CryptoService).hashPassword(password),
        lastName: 'User',
        username
      }
    });
  };

  beforeAll(async () => {
    const response = await login('admin');
    expect(response.statusCode).toBe(200);
    adminHeaders = { authorization: `Bearer ${response.json<{ accessToken: string }>().accessToken}` };
    expect((await createUser('case.user')).statusCode).toBe(201);
  });

  it('should log in with the username typed in any case', async () => {
    expect((await login('CASE.USER')).statusCode).toBe(200);
  });

  it('should match the username literally, so a dot in it is not a wildcard', async () => {
    expect((await login('CASExUSER')).statusCode).toBe(401);
  });

  it('should refuse creating a user whose username differs from an existing one only by case', async () => {
    expect((await createUser('Case.User')).statusCode).toBe(409);
  });

  describe('users created before usernames ignored case', () => {
    beforeAll(async () => {
      await insertLegacyUser('legacy', PASSWORD);
      await insertLegacyUser('Legacy', OTHER_PASSWORD);
    });

    it('should log each one in by its exact case', async () => {
      expect((await login('legacy')).statusCode).toBe(200);
      expect((await login('Legacy', OTHER_PASSWORD)).statusCode).toBe(200);
    });

    it('should refuse a case matching neither exactly, rather than guess between them', async () => {
      expect((await login('LEGACY')).statusCode).toBe(409);
    });
  });
});
