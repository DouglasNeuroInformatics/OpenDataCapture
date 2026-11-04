import { randomUUID } from 'node:crypto';

import type { Group } from '@opendatacapture/schemas/group';
import type { PermissionSet, PermissionSetSummary } from '@opendatacapture/schemas/permission-set';
import type { User } from '@opendatacapture/schemas/user';
import { beforeAll, describe, expect, it } from 'vitest';

import { defineSuite } from '../helpers';

const PASSWORD = 'DataCapture2025_Test';

type SignedRule = { action: string; conditions?: unknown; subject: string };

/**
 * Runs after `02-user-permissions`, whose setup created the administrator. Everything here is proven
 * against the real database: holder counts, the `SetNull` that deleting a set relies on, and the
 * rules a holder's token ends up carrying.
 */
export default defineSuite('permission sets', function () {
  let adminHeaders: { authorization: string };
  let group: Group;

  const login = async (username: string): Promise<string> => {
    const response = await this.app.inject({
      method: 'POST',
      payload: { password: PASSWORD, username },
      url: '/v1/auth/login'
    });
    expect(response.statusCode).toBe(200);
    return response.json<{ accessToken: string }>().accessToken;
  };

  const signedRules = (accessToken: string): SignedRule[] => {
    const payload = Buffer.from(accessToken.split('.')[1]!, 'base64url').toString();
    return (JSON.parse(payload) as { permissions: SignedRule[] }).permissions;
  };

  const createPermissionSet = async (): Promise<PermissionSet> => {
    const response = await this.app.inject({
      headers: adminHeaders,
      method: 'POST',
      payload: {
        name: `Set ${randomUUID()}`,
        rules: [
          { action: 'read', scope: 'HOLDER_GROUPS', subject: 'InstrumentRecord' },
          { action: 'read', scope: 'ALL_GROUPS', subject: 'Assignment' }
        ]
      },
      url: '/v1/permission-sets'
    });
    expect(response.statusCode).toBe(201);
    return response.json<PermissionSet>();
  };

  const createUser = async (payload: object = {}) => {
    return this.app.inject({
      headers: adminHeaders,
      method: 'POST',
      payload: {
        basePermissionLevel: 'STANDARD',
        firstName: 'Set',
        groupIds: [group.id],
        lastName: 'Holder',
        password: PASSWORD,
        username: `holder-${randomUUID()}`,
        ...payload
      },
      url: '/v1/users'
    });
  };

  const findPermissionSet = async (id: string): Promise<PermissionSetSummary> => {
    const response = await this.app.inject({ headers: adminHeaders, method: 'GET', url: `/v1/permission-sets/${id}` });
    expect(response.statusCode).toBe(200);
    return response.json<PermissionSetSummary>();
  };

  const findUser = async (id: string): Promise<User> => {
    const response = await this.app.inject({ headers: adminHeaders, method: 'GET', url: `/v1/users/${id}` });
    expect(response.statusCode).toBe(200);
    return response.json<User>();
  };

  const setPermissions = (id: string, payload: object) => {
    return this.app.inject({ headers: adminHeaders, method: 'PUT', payload, url: `/v1/users/${id}/permissions` });
  };

  beforeAll(async () => {
    adminHeaders = { authorization: `Bearer ${await login('admin')}` };
    const response = await this.app.inject({
      headers: adminHeaders,
      method: 'POST',
      payload: { name: 'Permission Set Group', type: 'RESEARCH' },
      url: '/v1/groups'
    });
    expect(response.statusCode).toBe(201);
    group = response.json<Group>();
  });

  describe('POST /v1/permission-sets', () => {
    it('should refuse a name another set already has', async () => {
      const { name } = await createPermissionSet();
      const response = await this.app.inject({
        headers: adminHeaders,
        method: 'POST',
        payload: { name, rules: [{ action: 'read', scope: 'ALL_GROUPS', subject: 'Subject' }] },
        url: '/v1/permission-sets'
      });
      expect(response.statusCode).toBe(409);
    });

    it('should refuse a set granting manage all, which would make every holder an administrator', async () => {
      const response = await this.app.inject({
        headers: adminHeaders,
        method: 'POST',
        payload: { name: `Set ${randomUUID()}`, rules: [{ action: 'manage', scope: 'ALL_GROUPS', subject: 'all' }] },
        url: '/v1/permission-sets'
      });
      expect(response.statusCode).toBe(400);
    });

    it('should refuse a user below administrator, even one whose set reaches every other resource', async () => {
      const response = await this.app.inject({
        headers: adminHeaders,
        method: 'POST',
        payload: {
          name: `Set ${randomUUID()}`,
          rules: (['create', 'delete', 'read', 'update'] as const).map((action) => ({
            action,
            scope: 'ALL_GROUPS',
            subject: 'all'
          }))
        },
        url: '/v1/permission-sets'
      });
      expect(response.statusCode).toBe(201);
      const holder = await createUser({ permissionSetId: response.json<PermissionSet>().id });
      expect(holder.statusCode).toBe(201);
      const headers = { authorization: `Bearer ${await login(holder.json<User>().username)}` };
      const listing = await this.app.inject({ headers, method: 'GET', url: '/v1/permission-sets' });
      expect(listing.statusCode).toBe(403);
    });
  });

  describe('assigning a set', () => {
    it('should link a set when the user is created, and count them as a holder', async () => {
      const permissionSet = await createPermissionSet();
      const response = await createUser({ permissionSetId: permissionSet.id });
      expect(response.statusCode).toBe(201);
      expect(response.json<User>().permissionSetId).toBe(permissionSet.id);
      expect((await findPermissionSet(permissionSet.id)).holderCount).toBe(1);
    });

    it('should refuse a set for an administrator being created', async () => {
      const permissionSet = await createPermissionSet();
      const response = await createUser({ basePermissionLevel: 'ADMIN', permissionSetId: permissionSet.id });
      expect(response.statusCode).toBe(400);
    });

    it('should refuse a set that does not exist', async () => {
      const response = await createUser({ permissionSetId: '000000000000000000000000' });
      expect(response.statusCode).toBe(404);
    });

    it("should sign the set's rules into the holder's token, confined to the holder's groups where the set says so", async () => {
      const permissionSet = await createPermissionSet();
      const user = (await createUser()).json<User>();
      const response = await setPermissions(user.id, { kind: 'permissionSet', permissionSetId: permissionSet.id });
      expect(response.statusCode).toBe(200);
      const rules = signedRules(await login(user.username));
      expect(rules).toContainEqual({
        action: 'read',
        conditions: { groupId: { in: [group.id] } },
        subject: 'InstrumentRecord'
      });
      expect(rules).toContainEqual({ action: 'read', subject: 'Assignment' });
    });

    it('should switch between a set and custom grants, each write emptying the other', async () => {
      const permissionSet = await createPermissionSet();
      const user = (await createUser()).json<User>();
      const custom = { kind: 'custom', permissions: [{ action: 'read', groupId: null, subject: 'Session' }] };

      expect((await setPermissions(user.id, custom)).statusCode).toBe(200);
      expect(
        (await setPermissions(user.id, { kind: 'permissionSet', permissionSetId: permissionSet.id })).statusCode
      ).toBe(200);
      expect(await findUser(user.id)).toMatchObject({ additionalPermissions: [], permissionSetId: permissionSet.id });

      expect((await setPermissions(user.id, custom)).statusCode).toBe(200);
      expect(await findUser(user.id)).toMatchObject({
        additionalPermissions: custom.permissions,
        permissionSetId: null
      });
      expect((await findPermissionSet(permissionSet.id)).holderCount).toBe(0);
    });

    it('should refuse a set for an existing administrator', async () => {
      const permissionSet = await createPermissionSet();
      const admin = (await createUser({ basePermissionLevel: 'ADMIN', groupIds: [] })).json<User>();
      const response = await setPermissions(admin.id, { kind: 'permissionSet', permissionSetId: permissionSet.id });
      expect(response.statusCode).toBe(400);
    });

    it('should remove the set from a user promoted to administrator', async () => {
      const permissionSet = await createPermissionSet();
      const user = (await createUser({ permissionSetId: permissionSet.id })).json<User>();
      const response = await this.app.inject({
        headers: adminHeaders,
        method: 'PATCH',
        payload: { basePermissionLevel: 'ADMIN' },
        url: `/v1/users/${user.id}`
      });
      expect(response.statusCode).toBe(200);
      expect((await findUser(user.id)).permissionSetId).toBeNull();
    });

    it('should promote a user who never held a set', async () => {
      const user = (await createUser()).json<User>();
      const response = await this.app.inject({
        headers: adminHeaders,
        method: 'PATCH',
        payload: { basePermissionLevel: 'ADMIN' },
        url: `/v1/users/${user.id}`
      });
      expect(response.statusCode).toBe(200);
    });
  });

  describe('PATCH /v1/permission-sets/:id', () => {
    it("should change what a holder's next token carries", async () => {
      const permissionSet = await createPermissionSet();
      const user = (await createUser({ permissionSetId: permissionSet.id })).json<User>();
      const response = await this.app.inject({
        headers: adminHeaders,
        method: 'PATCH',
        payload: { rules: [{ action: 'read', scope: 'ALL_GROUPS', subject: 'Session' }] },
        url: `/v1/permission-sets/${permissionSet.id}`
      });
      expect(response.statusCode).toBe(200);
      const rules = signedRules(await login(user.username));
      expect(rules).toContainEqual({ action: 'read', subject: 'Session' });
      expect(rules).not.toContainEqual(expect.objectContaining({ subject: 'Assignment' }));
    });
  });

  describe('DELETE /v1/permission-sets/:id', () => {
    it('should remove the set from every holder, leaving them their base level alone', async () => {
      const permissionSet = await createPermissionSet();
      const holders = [
        (await createUser({ permissionSetId: permissionSet.id })).json<User>(),
        (await createUser({ permissionSetId: permissionSet.id })).json<User>()
      ];
      expect((await findPermissionSet(permissionSet.id)).holderCount).toBe(2);

      const response = await this.app.inject({
        headers: adminHeaders,
        method: 'DELETE',
        url: `/v1/permission-sets/${permissionSet.id}`
      });
      expect(response.statusCode).toBe(200);

      for (const holder of holders) {
        expect((await findUser(holder.id)).permissionSetId).toBeNull();
        expect(signedRules(await login(holder.username))).not.toContainEqual(
          expect.objectContaining({ subject: 'Assignment' })
        );
      }
      const listing = await this.app.inject({ headers: adminHeaders, method: 'GET', url: '/v1/permission-sets' });
      expect(listing.json<PermissionSetSummary[]>().map(({ id }) => id)).not.toContain(permissionSet.id);
    });

    it('should answer a set that does not exist with not found', async () => {
      const response = await this.app.inject({
        headers: adminHeaders,
        method: 'DELETE',
        url: '/v1/permission-sets/000000000000000000000000'
      });
      expect(response.statusCode).toBe(404);
    });
  });
});
