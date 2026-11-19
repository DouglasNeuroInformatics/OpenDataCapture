import { randomUUID } from 'node:crypto';

import type { $CreateSubjectData } from '@opendatacapture/schemas/subject';
import { beforeAll, describe, expect, it } from 'vitest';

import { defineSuite } from '../helpers';

const PASSWORD = 'DataCapture2025_Test';

/** Logins come from an address of their own, so they spend none of the default address's throttle budget. */
const LOGIN_ADDRESS = '192.0.2.72';

/**
 * The start-session form fills its identifier combobox from these routes. Their queries lean on
 * MongoDB semantics a mocked model cannot check (`isSet` on an absent field, a range over the id's
 * scope prefix), so they are exercised here against a real database.
 */
export default defineSuite('subject custom id suggestions', function () {
  let adminHeaders: { authorization: string };
  let outsiderHeaders: { authorization: string };

  const login = async (username: string) => {
    const response = await this.app.inject({
      method: 'POST',
      payload: { password: PASSWORD, username },
      remoteAddress: LOGIN_ADDRESS,
      url: '/v1/auth/login'
    });
    expect(response.statusCode).toBe(200);
    return { authorization: `Bearer ${response.json<{ accessToken: string }>().accessToken}` };
  };

  const createGroup = async () => {
    const response = await this.app.inject({
      headers: adminHeaders,
      method: 'POST',
      payload: { name: `Custom Ids ${randomUUID()}`, type: 'RESEARCH' },
      url: '/v1/groups'
    });
    expect(response.statusCode).toBe(201);
    return response.json<{ id: string }>().id;
  };

  /** Enrols a subject the way the app does, by starting a session for it. */
  const createSession = async (groupId: null | string, subjectData: $CreateSubjectData) => {
    const response = await this.app.inject({
      headers: adminHeaders,
      method: 'POST',
      payload: { date: new Date(), groupId, subjectData, type: 'IN_PERSON' },
      url: '/v1/sessions'
    });
    expect(response.statusCode).toBe(201);
  };

  const findCustomIds = async (url: string, headers = adminHeaders) => {
    const response = await this.app.inject({ headers, method: 'GET', url });
    expect(response.statusCode).toBe(200);
    return response.json<string[]>();
  };

  beforeAll(async () => {
    adminHeaders = await login('admin');
    const username = `custom-ids-${randomUUID()}`;
    const user = await this.app.inject({
      headers: adminHeaders,
      method: 'POST',
      payload: {
        basePermissionLevel: 'GROUP_MANAGER',
        firstName: 'Outside',
        groupIds: [await createGroup()],
        lastName: 'Manager',
        password: PASSWORD,
        username
      },
      url: '/v1/users'
    });
    expect(user.statusCode).toBe(201);
    outsiderHeaders = await login(username);
  });

  describe('GET /v1/subjects/groups/:groupId/custom-ids', () => {
    it('should list the group’s custom-id subjects but not those identified by personal information', async () => {
      const groupId = await createGroup();
      const bareId = `bare-${randomUUID()}`;
      const customId = `custom-${randomUUID()}`;
      const personalInfoId = `personal-${randomUUID()}`;
      // The start-session form sends a custom-id subject's date of birth and sex, but no name.
      await createSession(groupId, { id: bareId });
      await createSession(groupId, { dateOfBirth: new Date('1990-01-01'), id: customId, sex: 'MALE' });
      await createSession(groupId, {
        dateOfBirth: new Date('1990-01-01'),
        firstName: 'Ada',
        id: personalInfoId,
        lastName: 'Lovelace',
        sex: 'FEMALE'
      });

      const ids = await findCustomIds(`/v1/subjects/groups/${groupId}/custom-ids`);

      expect(ids.toSorted()).toStrictEqual([bareId, customId]);
    });

    it('should not list custom-id subjects from another group', async () => {
      const groupId = await createGroup();
      await createSession(await createGroup(), { id: `other-${randomUUID()}` });

      expect(await findCustomIds(`/v1/subjects/groups/${groupId}/custom-ids`)).toStrictEqual([]);
    });

    it('should list nothing to a group manager asking for a group they are not a member of', async () => {
      const groupId = await createGroup();
      await createSession(groupId, { id: `private-${randomUUID()}` });

      expect(await findCustomIds(`/v1/subjects/groups/${groupId}/custom-ids`, outsiderHeaders)).toStrictEqual([]);
    });
  });

  describe('GET /v1/subjects/default-group/custom-ids', () => {
    it('should list custom ids scoped to the default group, but not those scoped to a named group', async () => {
      const rootScopedId = `root$default-${randomUUID()}`;
      const groupScopedId = `Clinic$named-${randomUUID()}`;
      await createSession(null, { id: rootScopedId });
      await createSession(await createGroup(), { id: groupScopedId });

      const ids = await findCustomIds('/v1/subjects/default-group/custom-ids');

      expect(ids).toContain(rootScopedId);
      expect(ids).not.toContain(groupScopedId);
    });

    // Starting a session in a group adds that group to the subject, but leaves its id alone.
    it('should still list a default group custom id after its subject is seen in a group', async () => {
      const rootScopedId = `root$regrouped-${randomUUID()}`;
      await createSession(null, { id: rootScopedId });
      await createSession(await createGroup(), { id: rootScopedId });

      expect(await findCustomIds('/v1/subjects/default-group/custom-ids')).toContain(rootScopedId);
    });

    it('should list no default group subjects to a group manager outside their groups', async () => {
      await createSession(null, { id: `root$default-${randomUUID()}` });

      expect(await findCustomIds('/v1/subjects/default-group/custom-ids', outsiderHeaders)).toStrictEqual([]);
    });
  });
});
