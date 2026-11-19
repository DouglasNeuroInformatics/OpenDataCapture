import { randomUUID } from 'node:crypto';

import type { Group } from '@opendatacapture/schemas/group';
import type { Session } from '@opendatacapture/schemas/session';
import { beforeAll, expect, it } from 'vitest';

import { InstrumentsService } from '@/instruments/instruments.service';

import { defineSuite, scoreFormBundle } from '../helpers';

const PASSWORD = 'DataCapture2025_Test';

type AuthHeaders = { authorization: string };

export default defineSuite('group access', function () {
  let adminHeaders: AuthHeaders;

  const login = async (username: string): Promise<AuthHeaders> => {
    const response = await this.app.inject({
      method: 'POST',
      payload: { password: PASSWORD, username },
      url: '/v1/auth/login'
    });
    expect(response.statusCode).toBe(200);
    return { authorization: `Bearer ${response.json<{ accessToken: string }>().accessToken}` };
  };

  const createGroup = async (): Promise<Group> => {
    const response = await this.app.inject({
      headers: adminHeaders,
      method: 'POST',
      payload: { name: `Group Access ${randomUUID()}`, type: 'CLINICAL' },
      url: '/v1/groups'
    });
    expect(response.statusCode).toBe(201);
    return response.json<Group>();
  };

  /** A group manager of `group`, by username; every one shares {@link PASSWORD}. */
  const createManager = async (group: Group): Promise<string> => {
    const username = `group-access-${randomUUID()}`;
    const response = await this.app.inject({
      headers: adminHeaders,
      method: 'POST',
      payload: {
        basePermissionLevel: 'GROUP_MANAGER',
        firstName: 'Group',
        groupIds: [group.id],
        lastName: 'Manager',
        password: PASSWORD,
        username
      },
      url: '/v1/users'
    });
    expect(response.statusCode).toBe(201);
    return username;
  };

  const readGroup = (id: string, headers: AuthHeaders) => {
    return this.app.inject({ headers, method: 'GET', url: `/v1/groups/${id}` });
  };

  beforeAll(async () => {
    adminHeaders = await login('admin');
  });

  // Deliberately POST alone, without the PATCH a seeding helper follows it with, so creation must
  // connect the instrument itself. An uploaded instrument has no `sourceRepoId` key at all, and the
  // selection has to match that absence as well as an explicit null.
  it('should give a newly created group access to every uploaded instrument', async () => {
    const instrument = await this.app.get(InstrumentsService).create({ bundle: scoreFormBundle('GROUP_ACCESS_NEW') });

    const group = await createGroup();

    expect(group.accessibleInstrumentIds).toContain(instrument.id);
  });

  it('should keep the accessible instruments and settings a group manager saves for their group', async () => {
    const instruments = await Promise.all(
      ['GROUP_ACCESS_KEPT', 'GROUP_ACCESS_DROPPED'].map((name) => {
        return this.app.get(InstrumentsService).create({ bundle: scoreFormBundle(name) });
      })
    );
    const group = await createGroup();
    const managerHeaders = await login(await createManager(group));
    const accessibleInstrumentIds = group.accessibleInstrumentIds.filter((id) => id !== instruments[1]!.id);

    const update = await this.app.inject({
      headers: managerHeaders,
      method: 'PATCH',
      payload: { accessibleInstrumentIds, settings: { subjectIdDisplayLength: 6 } },
      url: `/v1/groups/${group.id}`
    });
    expect(update.statusCode).toBe(200);

    const saved = (await readGroup(group.id, managerHeaders)).json<Group>();
    expect(saved.accessibleInstrumentIds).toContain(instruments[0]!.id);
    expect(saved.accessibleInstrumentIds).not.toContain(instruments[1]!.id);
    expect(saved.settings.subjectIdDisplayLength).toBe(6);
  });

  // An archive reaches a member only through the token they are issued next, so each read signs in
  // afresh.
  it('should take an archived group and its subjects away from its members, and give them back on unarchive', async () => {
    const group = await createGroup();
    const session = await this.app.inject({
      headers: adminHeaders,
      method: 'POST',
      payload: { date: new Date(), groupId: group.id, subjectData: { id: randomUUID() }, type: 'IN_PERSON' },
      url: '/v1/sessions'
    });
    expect(session.statusCode).toBe(201);
    const { subjectId } = session.json<Session>();
    const username = await createManager(group);

    const readAsMember = async () => {
      const headers = await login(username);
      const [groupResponse, subjectResponse] = await Promise.all([
        readGroup(group.id, headers),
        this.app.inject({ headers, method: 'GET', url: `/v1/subjects/${subjectId}` })
      ]);
      return { group: groupResponse.statusCode, subject: subjectResponse.statusCode };
    };
    const setArchived = async (action: 'archive' | 'unarchive') => {
      const response = await this.app.inject({
        headers: adminHeaders,
        method: 'PATCH',
        url: `/v1/groups/${group.id}/${action}`
      });
      expect(response.statusCode).toBe(200);
    };

    expect(await readAsMember()).toStrictEqual({ group: 200, subject: 200 });
    await setArchived('archive');
    expect(await readAsMember()).toStrictEqual({ group: 404, subject: 404 });
    await setArchived('unarchive');
    expect(await readAsMember()).toStrictEqual({ group: 200, subject: 200 });
  });
});
