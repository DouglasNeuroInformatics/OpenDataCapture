import { PRISMA_CLIENT_TOKEN } from '@douglasneuroinformatics/libnest';
import type { Group } from '@opendatacapture/schemas/group';
import { $User } from '@opendatacapture/schemas/user';
import type { User } from '@opendatacapture/schemas/user';
import { beforeAll, describe, expect, it } from 'vitest';

import type { RuntimePrismaClient } from '@/core/prisma';

import { defineSuite } from '../helpers';

const PASSWORD = 'DataCapture2025_Test';

const ADMIN = { firstName: 'Admin', lastName: 'User', password: PASSWORD, username: 'admin' };

type SignedRule = { action: string; conditions?: unknown; subject: string };

export default defineSuite('user permissions', function () {
  let adminHeaders: { authorization: string };
  let group: Group;
  let otherGroup: Group;
  let user: User;

  const login = async (username: string): Promise<string> => {
    const response = await this.app.inject({
      method: 'POST',
      payload: { password: PASSWORD, username },
      url: '/v1/auth/login'
    });
    expect(response.statusCode).toBe(200);
    return response.json<{ accessToken: string }>().accessToken;
  };

  /** The rules signed into a token, which are what every later request is judged by. */
  const signedRules = (accessToken: string): SignedRule[] => {
    const payload = Buffer.from(accessToken.split('.')[1]!, 'base64url').toString();
    return (JSON.parse(payload) as { permissions: SignedRule[] }).permissions;
  };

  const createGroup = async (name: string): Promise<Group> => {
    const response = await this.app.inject({
      headers: adminHeaders,
      method: 'POST',
      payload: { name, type: 'RESEARCH' },
      url: '/v1/groups'
    });
    expect(response.statusCode).toBe(201);
    return response.json<Group>();
  };

  beforeAll(async () => {
    const setup = await this.app.inject({
      method: 'POST',
      payload: { admin: ADMIN, enableExperimentalFeatures: false, initDemo: false },
      url: '/v1/setup'
    });
    expect(setup.statusCode).toBe(201);
    adminHeaders = { authorization: `Bearer ${await login(ADMIN.username)}` };
    group = await createGroup('Scoped Group');
    otherGroup = await createGroup('Other Group');
    const response = await this.app.inject({
      headers: adminHeaders,
      method: 'POST',
      payload: {
        basePermissionLevel: 'STANDARD',
        firstName: 'Jane',
        groupIds: [group.id],
        lastName: 'Doe',
        password: PASSWORD,
        username: 'jane.doe'
      },
      url: '/v1/users'
    });
    expect(response.statusCode).toBe(201);
    user = response.json<User>();
  });

  describe('PUT /v1/users/:id/permissions', () => {
    it('should refuse a grant confined to a group the user does not belong to', async () => {
      const response = await this.app.inject({
        headers: adminHeaders,
        method: 'PUT',
        payload: { permissions: [{ action: 'read', groupId: otherGroup.id, subject: 'Subject' }] },
        url: `/v1/users/${user.id}/permissions`
      });
      expect(response.statusCode).toBe(400);
    });

    it('should store a grant confined to a group the user belongs to, and sign its condition into the token', async () => {
      const response = await this.app.inject({
        headers: adminHeaders,
        method: 'PUT',
        payload: { permissions: [{ action: 'read', groupId: group.id, subject: 'Subject' }] },
        url: `/v1/users/${user.id}/permissions`
      });
      expect(response.statusCode).toBe(200);
      expect(response.json<User>().additionalPermissions).toEqual([
        { action: 'read', groupId: group.id, subject: 'Subject' }
      ]);
      expect(signedRules(await login(user.username))).toContainEqual({
        action: 'read',
        conditions: { groupIds: { hasSome: [group.id] } },
        subject: 'Subject'
      });
    });
  });

  // The permissions route refuses a `User` write, but one stored before it did is still in the
  // database, so it is written directly here. Each request would otherwise end with its holder an
  // administrator at their next login.
  describe('a user write grant stored before it was refused', () => {
    const createUser = async (username: string, basePermissionLevel: 'ADMIN' | 'GROUP_MANAGER'): Promise<User> => {
      const response = await this.app.inject({
        headers: adminHeaders,
        method: 'POST',
        payload: {
          basePermissionLevel,
          firstName: 'Test',
          groupIds: [group.id],
          lastName: 'User',
          password: PASSWORD,
          username
        },
        url: '/v1/users'
      });
      expect(response.statusCode).toBe(201);
      return response.json<User>();
    };

    it('should reach none of the routes that write a user', async () => {
      const grantee = await createUser('grantee', 'GROUP_MANAGER');
      const teammateAdmin = await createUser('teammate.admin', 'ADMIN');
      await this.app.get<RuntimePrismaClient>(PRISMA_CLIENT_TOKEN).user.update({
        data: { additionalPermissions: [{ action: 'manage', groupId: group.id, subject: 'User' }] },
        where: { id: grantee.id }
      });
      const headers = { authorization: `Bearer ${await login(grantee.username)}` };

      const attempts = [
        { method: 'PATCH', payload: { basePermissionLevel: 'ADMIN' }, url: `/v1/users/${grantee.id}` },
        { method: 'PATCH', payload: { groupIds: [group.id, otherGroup.id] }, url: `/v1/users/${grantee.id}` },
        { method: 'PATCH', payload: { password: PASSWORD }, url: `/v1/users/${teammateAdmin.id}` },
        { method: 'DELETE', url: `/v1/users/${teammateAdmin.id}` },
        {
          method: 'POST',
          payload: {
            basePermissionLevel: 'ADMIN',
            firstName: 'Probe',
            groupIds: [],
            lastName: 'User',
            password: PASSWORD,
            username: 'probe'
          },
          url: '/v1/users'
        }
      ] as const;
      for (const attempt of attempts) {
        const response = await this.app.inject({ headers, ...attempt });
        expect(response.statusCode, `${attempt.method} ${attempt.url}`).toBe(403);
      }
    });
  });

  // Rules written before `AuthRule.groupId` existed have no such field at all. The web client parses
  // every user against `$User`, so this pins that Prisma reads the absent field back as null rather
  // than leaving it undefined, and that the factory then applies the rule as the unscoped grant it
  // always was.
  describe('a rule stored before scoping existed', () => {
    it('should read back as unscoped and be signed into the token without a condition', async () => {
      const prisma = this.app.get<RuntimePrismaClient>(PRISMA_CLIENT_TOKEN);
      await prisma.$runCommandRaw({
        update: 'UserModel',
        updates: [{ q: { _id: { $oid: user.id } }, u: { $unset: { 'additionalPermissions.0.groupId': '' } } }]
      });
      const response = await this.app.inject({ headers: adminHeaders, method: 'GET', url: `/v1/users/${user.id}` });
      expect(response.statusCode).toBe(200);
      expect($User.parse(response.json()).additionalPermissions).toEqual([
        { action: 'read', groupId: null, subject: 'Subject' }
      ]);
      expect(signedRules(await login(user.username))).toContainEqual({ action: 'read', subject: 'Subject' });
    });
  });
});
