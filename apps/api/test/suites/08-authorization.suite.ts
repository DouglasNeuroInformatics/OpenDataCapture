import { randomUUID } from 'node:crypto';

import { PRISMA_CLIENT_TOKEN } from '@douglasneuroinformatics/libnest';
import type { Group } from '@opendatacapture/schemas/group';
import type { InstrumentRecord } from '@opendatacapture/schemas/instrument-records';
import type { Session } from '@opendatacapture/schemas/session';
import type { User } from '@opendatacapture/schemas/user';
import { beforeAll, describe, expect, it } from 'vitest';

import type { RuntimePrismaClient } from '@/core/prisma';

import { defineSuite, scoreFormBundle } from '../helpers';

const PASSWORD = 'DataCapture2025_Test';

/**
 * Every login here comes from this one address rather than inject's default. The throttler allows 50
 * logins a minute per client, and the suites before this one already spend much of that on the
 * default address within the same minute.
 */
const LOGIN_ADDRESS = '192.0.2.80';

const INSTRUMENT_NAME = 'AUTHORIZATION_SCORE';

type AuthHeaders = { authorization: string };

type BasePermissionLevel = 'ADMIN' | 'GROUP_MANAGER' | 'STANDARD';

type RequestOptions = { method: 'DELETE' | 'GET' | 'PATCH' | 'POST' | 'PUT'; payload?: object; url: string };

/** A series over the suite's form, as a bundle; a series names its items and holds no schema of its own. */
function seriesBundle(title: string) {
  return `(async () => ({
    __runtimeVersion: 1,
    content: [{ edition: 1, name: ${JSON.stringify(INSTRUMENT_NAME)} }, { edition: 1, name: ${JSON.stringify(INSTRUMENT_NAME)} }],
    details: { description: 'A series', license: 'Apache-2.0', title: ${JSON.stringify(title)} },
    kind: 'SERIES',
    language: 'en',
    tags: []
  }))()`;
}

/**
 * Row-level scoping is not observable in the api's unit tests, whose models are mocked, so what each
 * role may reach is asserted here against real rows. Runs after `02-user-permissions`, whose setup
 * created the administrator.
 */
export default defineSuite('authorization', function () {
  let prisma: RuntimePrismaClient;
  let adminHeaders: AuthHeaders;
  let instrumentId: string;
  /** The group the managers and standard users below belong to. */
  let ownGroup: Group;
  let foreignGroup: Group;
  let manager: User;
  let managerHeaders: AuthHeaders;
  let standard: User;
  let standardHeaders: AuthHeaders;
  /** A user of the foreign group, whom no one in the own group may read. */
  let outsider: User;

  const login = async (username: string): Promise<AuthHeaders> => {
    const response = await this.app.inject({
      method: 'POST',
      payload: { password: PASSWORD, username },
      remoteAddress: LOGIN_ADDRESS,
      url: '/v1/auth/login'
    });
    expect(response.statusCode).toBe(200);
    return { authorization: `Bearer ${response.json<{ accessToken: string }>().accessToken}` };
  };

  const request = (headers: AuthHeaders, options: RequestOptions) => this.app.inject({ headers, ...options });

  /** The reduced token the playground uploads with, minted from an administrator's login token. */
  const mintInstrumentToken = async (): Promise<AuthHeaders> => {
    const response = await request(adminHeaders, { method: 'GET', url: '/v1/auth/create-instrument-token' });
    expect(response.statusCode).toBe(200);
    return { authorization: `Bearer ${response.json<{ accessToken: string }>().accessToken}` };
  };

  const createGroup = async (): Promise<Group> => {
    const response = await request(adminHeaders, {
      method: 'POST',
      payload: { name: `Authorization ${randomUUID()}`, type: 'CLINICAL' },
      url: '/v1/groups'
    });
    expect(response.statusCode).toBe(201);
    const group = response.json<Group>();
    const granted = await request(adminHeaders, {
      method: 'PATCH',
      payload: { accessibleInstrumentIds: [instrumentId] },
      url: `/v1/groups/${group.id}`
    });
    expect(granted.statusCode).toBe(200);
    return group;
  };

  const createUser = async (
    basePermissionLevel: BasePermissionLevel,
    groupIds: string[],
    overrides: { mustResetPassword?: boolean } = {}
  ): Promise<User> => {
    const response = await request(adminHeaders, {
      method: 'POST',
      payload: {
        basePermissionLevel,
        firstName: 'Authorization',
        groupIds,
        lastName: 'User',
        password: PASSWORD,
        username: `authorization-${randomUUID()}`,
        ...overrides
      },
      url: '/v1/users'
    });
    expect(response.statusCode).toBe(201);
    return response.json<User>();
  };

  const setPermissions = async (userId: string, permissions: object[]) => {
    const response = await request(adminHeaders, {
      method: 'PUT',
      payload: { kind: 'custom', permissions },
      url: `/v1/users/${userId}/permissions`
    });
    expect(response.statusCode).toBe(200);
  };

  /** Records for one subject per id, uploaded into the group as an administrator. */
  const uploadRecords = async (groupId: string, subjectIds: string[]) => {
    const response = await request(adminHeaders, {
      method: 'POST',
      payload: {
        groupId,
        instrumentId,
        records: subjectIds.map((subjectId) => ({ data: { score: 1 }, date: new Date(), subjectId }))
      },
      url: '/v1/instrument-records/upload'
    });
    expect(response.statusCode).toBe(201);
  };

  /** An in-person session for a new subject, which enrols that subject in the group. */
  const createSession = async (groupId: string): Promise<Session> => {
    const session = await request(adminHeaders, {
      method: 'POST',
      payload: { date: new Date(), groupId, subjectData: { id: `authorization-${randomUUID()}` }, type: 'IN_PERSON' },
      url: '/v1/sessions'
    });
    expect(session.statusCode).toBe(201);
    return session.json<Session>();
  };

  /** A record for a new subject in the group, written the way a completed instrument is. */
  const createRecord = async (groupId: string): Promise<InstrumentRecord> => {
    const { id: sessionId, subjectId } = await createSession(groupId);
    const record = await request(adminHeaders, {
      method: 'POST',
      payload: { data: { score: 1 }, date: new Date(), groupId, instrumentId, sessionId, subjectId },
      url: '/v1/instrument-records'
    });
    expect(record.statusCode).toBe(201);
    return record.json<InstrumentRecord>();
  };

  /** A subject enrolled in the group, holding no records. */
  const createSubject = async (groupId: string): Promise<string> => {
    return (await createSession(groupId)).subjectId;
  };

  /**
   * A series owned by the group, stored directly: `POST /v1/instruments/series` checks the new title
   * against every stored instrument, and earlier suites store placeholder bundles it cannot read.
   */
  const createSeries = async (groupId: string): Promise<string> => {
    const series = await prisma.instrument.create({
      data: {
        bundle: seriesBundle(`Series ${randomUUID()}`),
        groupIds: [groupId],
        id: `authorization-series-${randomUUID()}`,
        seriesGroupId: groupId
      }
    });
    return series.id;
  };

  const readUsernames = async (headers: AuthHeaders): Promise<string[]> => {
    const response = await request(headers, { method: 'GET', url: '/v1/users' });
    expect(response.statusCode).toBe(200);
    return response.json<User[]>().map(({ username }) => username);
  };

  beforeAll(async () => {
    prisma = this.app.get(PRISMA_CLIENT_TOKEN);
    adminHeaders = await login('admin');
    // Through the upload route the playground uses, with the token it uses; the token tests below
    // re-post this bundle.
    const created = await request(await mintInstrumentToken(), {
      method: 'POST',
      payload: { bundle: scoreFormBundle(INSTRUMENT_NAME, { measured: true }) },
      url: '/v1/instruments'
    });
    expect(created.statusCode).toBe(201);
    instrumentId = created.json<{ id: string }>().id;
    ownGroup = await createGroup();
    foreignGroup = await createGroup();
    manager = await createUser('GROUP_MANAGER', [ownGroup.id]);
    standard = await createUser('STANDARD', [ownGroup.id]);
    outsider = await createUser('GROUP_MANAGER', [foreignGroup.id]);
    managerHeaders = await login(manager.username);
    standardHeaders = await login(standard.username);
  });

  // The sidebar hiding an admin link is cosmetic: a non-admin who navigates to an admin screen
  // directly gets the real screen (#1470). What makes that harmless is the api refusing every request
  // those screens fire, each gated on an action no non-admin base level grants.
  describe('privileged requests from the admin screens', () => {
    let target: { groupId: string; userId: string };

    beforeAll(async () => {
      const group = await createGroup();
      target = { groupId: group.id, userId: (await createUser('GROUP_MANAGER', [group.id])).id };
    });

    const privilegedRequests = (): { options: RequestOptions; what: string }[] => [
      {
        options: {
          method: 'POST',
          payload: {
            basePermissionLevel: 'ADMIN',
            firstName: 'Escalation',
            groupIds: [],
            lastName: 'Probe',
            password: PASSWORD,
            username: `escalation-${randomUUID()}`
          },
          url: '/v1/users'
        },
        what: 'create an administrator'
      },
      {
        options: { method: 'PATCH', payload: { basePermissionLevel: 'ADMIN' }, url: `/v1/users/${target.userId}` },
        what: "raise another user's permission level"
      },
      { options: { method: 'PATCH', url: `/v1/users/${target.userId}/archive` }, what: 'archive a user' },
      {
        // Gated on `manage all` rather than `update User`: an `update User` grant is one of the things
        // this route hands out, so holding one must not be enough to reach it.
        options: {
          method: 'PUT',
          payload: { kind: 'custom', permissions: [{ action: 'manage', groupId: null, subject: 'all' }] },
          url: `/v1/users/${target.userId}/permissions`
        },
        what: 'grant another user a permission'
      },
      {
        // The value sent is the seeded one, so were this ever to succeed it would change nothing.
        options: { method: 'PATCH', payload: { isExperimentalFeaturesEnabled: false }, url: '/v1/setup' },
        what: 'change instance-wide settings'
      },
      {
        // `POST /v1/groups` used to be declared `create Group`, which every group manager passes: the
        // guard sees the subject type, and their `manage Group` rule's condition is invisible to it.
        options: {
          method: 'POST',
          payload: { name: `Escalation ${randomUUID()}`, type: 'CLINICAL' },
          url: '/v1/groups'
        },
        what: 'create a group'
      },
      { options: { method: 'PATCH', url: `/v1/groups/${target.groupId}/archive` }, what: 'archive a group' },
      { options: { method: 'PATCH', url: `/v1/groups/${target.groupId}/unarchive` }, what: 'unarchive a group' },
      {
        options: {
          method: 'POST',
          payload: { url: 'https://github.com/example/example' },
          url: '/v1/instrument-repos'
        },
        what: 'import an instrument repository'
      },
      { options: { method: 'GET', url: '/v1/audit/logs' }, what: 'read the audit log' },
      {
        // The response omits the password, but the host, username and sender address are still the
        // institution's outbound mail identity.
        options: { method: 'GET', url: '/v1/mail/settings' },
        what: 'read the mail configuration'
      },
      {
        options: {
          method: 'PATCH',
          payload: { newUserEmailTemplate: { body: {}, subject: {} } },
          url: '/v1/mail/settings'
        },
        what: 'rewrite the mail configuration or templates'
      },
      {
        // The one request that opens an outbound SMTP connection to a caller-supplied host using the
        // stored credential.
        options: { method: 'POST', payload: {}, url: '/v1/mail/test' },
        what: 'probe a mail server with the stored credential'
      }
    ];

    it.each(['GROUP_MANAGER', 'STANDARD'] as const)(
      'should refuse every privileged request a %s user could fire from an admin screen',
      async (role) => {
        const headers = role === 'GROUP_MANAGER' ? managerHeaders : standardHeaders;
        for (const { options, what } of privilegedRequests()) {
          const response = await request(headers, options);
          expect.soft(response.statusCode, `a ${role} user must not be able to ${what}`).toBe(403);
        }
      }
    );
  });

  // `GET /v1/instruments/info` is gated on `read Instrument`, which a standard user holds, but
  // resolving `subjectId` reads instrument records, which they do not. Scoping that lookup to the
  // caller must answer with an empty list rather than failing the request.
  it.each(['GROUP_MANAGER', 'STANDARD'] as const)(
    'should answer the subject-filtered instrument list for a %s user rather than erroring',
    async (role) => {
      const response = await request(role === 'GROUP_MANAGER' ? managerHeaders : standardHeaders, {
        method: 'GET',
        url: '/v1/instruments/info?subjectId=any-subject'
      });
      expect(response.statusCode).toBe(200);
      expect(response.json()).toStrictEqual([]);
    }
  );

  // The playground uploads a bundle with a token minted by `GET /auth/create-instrument-token`, and
  // that token is the only non-interactive caller of `POST /instruments`, which is how #1392 severed
  // the two: the route moved to `manage Instrument` while the token still carried `create`.
  describe('granular instrument token', () => {
    it('should be accepted by the instrument upload, which interprets the bundle before refusing a duplicate', async () => {
      const response = await request(await mintInstrumentToken(), {
        method: 'POST',
        payload: { bundle: scoreFormBundle(INSTRUMENT_NAME, { measured: true }) },
        url: '/v1/instruments'
      });
      expect(response.statusCode).toBe(409);
    });

    it('should not mint its successor, so it expires an hour after it was issued', async () => {
      const response = await request(await mintInstrumentToken(), {
        method: 'GET',
        url: '/v1/auth/create-instrument-token'
      });
      expect(response.statusCode).toBe(403);
    });

    // The token's `manage Instrument` satisfies this route's `delete Instrument` with no group
    // condition, so a guard that admitted it would answer 404 for an id that exists in no group.
    it('should be refused on a route its permissions satisfy other than the upload', async () => {
      const response = await request(await mintInstrumentToken(), {
        method: 'DELETE',
        url: `/v1/instruments/${'0'.repeat(24)}`
      });
      expect(response.statusCode).toBe(403);
    });
  });

  // A group manager holds `manage Group` for their own groups, and `@RouteAccess` sees only the
  // subject type, so the guard lets this through and the row scoping in `GroupsService` is the whole
  // check. Asserted by effect rather than by status code for that reason.
  it('should not let a group manager rename a group they do not belong to', async () => {
    const response = await request(managerHeaders, {
      method: 'PATCH',
      payload: { name: `Hijacked ${randomUUID()}` },
      url: `/v1/groups/${foreignGroup.id}`
    });
    expect(response.statusCode).toBeGreaterThanOrEqual(400);
    const group = await request(adminHeaders, { method: 'GET', url: `/v1/groups/${foreignGroup.id}` });
    expect(group.json<Group>().name).toBe(foreignGroup.name);
  });

  // `create Assignment` is satisfied at the guard by a group manager's rule for their own groups, so
  // the service alone decides which group an assignment is filed under.
  it('should not let a group manager file an assignment under a group they do not belong to', async () => {
    const subjectId = await createSubject(foreignGroup.id);
    const response = await request(managerHeaders, {
      method: 'POST',
      payload: { expiresAt: new Date(Date.now() + 86_400_000), groupId: foreignGroup.id, instrumentId, subjectId },
      url: '/v1/assignments'
    });
    expect(response.statusCode).toBe(404);
    const assignments = await request(adminHeaders, { method: 'GET', url: `/v1/assignments?subjectId=${subjectId}` });
    expect(assignments.json()).toStrictEqual([]);
  });

  // The web client exports only the current group and then keeps only the subjects its table lists,
  // so no screen can show whether the api itself leaves another group's records out. Both records
  // belong to one subject enrolled in both groups, so only each record's own group separates them.
  // The body is msgpack, whose entries carry their record's group id as a plain string, so its bytes
  // are searched.
  it("should leave another group's records out of a group manager's export, even of a subject enrolled in both groups", async () => {
    const exportingGroup = await createGroup();
    const headers = await login((await createUser('GROUP_MANAGER', [exportingGroup.id])).username);
    const sharedSubjectId = `authorization-shared-${randomUUID()}`;
    await uploadRecords(exportingGroup.id, [sharedSubjectId]);
    await uploadRecords(foreignGroup.id, [sharedSubjectId]);

    const response = await request(headers, { method: 'GET', url: '/v1/instrument-records/export' });

    expect(response.statusCode).toBe(200);
    expect(response.rawPayload.includes(exportingGroup.id)).toBe(true);
    expect(response.rawPayload.includes(foreignGroup.id)).toBe(false);
  });

  // The datahub's instrument hub reads these endpoints with no `groupId`, so each decides on its own
  // what the caller may see. The manager here belongs to a group holding no records at all, so
  // anything the summaries name came from another group. The series summary counts only records
  // collected as part of a series, so the other group holds one of those as well as plain records.
  it.each(['by-instrument', 'by-series', 'by-subject'])(
    "should leave another group's records out of the %s datahub summary a group manager reads",
    async (summary) => {
      await uploadRecords(foreignGroup.id, [`authorization-hub-${randomUUID()}`]);
      const seriesRecord = await createRecord(foreignGroup.id);
      await prisma.instrumentRecord.update({
        data: { seriesInstrumentId: await createSeries(foreignGroup.id) },
        where: { id: seriesRecord.id }
      });
      const emptyGroup = await createGroup();
      const headers = await login((await createUser('GROUP_MANAGER', [emptyGroup.id])).username);

      const response = await request(headers, { method: 'GET', url: `/v1/instrument-records/summary/${summary}` });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toStrictEqual([]);
    }
  );

  describe('series records', () => {
    const readSeriesRecords = (seriesInstrumentId: string) => {
      return request(managerHeaders, {
        method: 'GET',
        url: `/v1/instrument-records?seriesInstrumentId=${seriesInstrumentId}`
      });
    };

    // `read Instrument` carries no group condition, so the ability cannot confine this lookup on its
    // own: before the caller's groups narrowed it, a series another group owns answered 200 with an
    // empty list where an unknown id answers 404, so the status alone reported that the series is real.
    it("should answer for another group's series exactly as for one that does not exist", async () => {
      const foreign = await readSeriesRecords(await createSeries(foreignGroup.id));
      const absent = await readSeriesRecords('0'.repeat(24));
      expect(foreign.statusCode).toBe(absent.statusCode);
      expect(foreign.statusCode).toBe(404);
    });

    // Or the narrowing above would have closed the leak by breaking the hub it exists to serve.
    it("should answer for a series the caller's own group owns", async () => {
      const response = await readSeriesRecords(await createSeries(ownGroup.id));
      expect(response.statusCode).toBe(200);
      expect(response.json()).toStrictEqual([]);
    });
  });

  // `/admin/users` renders a populated table for a non-admin, which is only acceptable because the
  // rows it can read are the ones they may already see elsewhere in the app.
  describe('GET /v1/users', () => {
    it('should scope the list a group manager reads to their own group', async () => {
      const usernames = await readUsernames(managerHeaders);
      expect(usernames).toContain(standard.username);
      expect(usernames).not.toContain(outsider.username);
    });

    it('should limit the list a standard user reads to their own account', async () => {
      expect(await readUsernames(standardHeaders)).toStrictEqual([standard.username]);
    });

    it('should confine a granted read to the group it names, where an unscoped one reads every group', async () => {
      const grantee = await createUser('STANDARD', [ownGroup.id]);

      // Permissions are signed into the token at login, so every grant needs a fresh one.
      await setPermissions(grantee.id, [{ action: 'read', groupId: ownGroup.id, subject: 'User' }]);
      const scoped = await readUsernames(await login(grantee.username));
      expect(scoped).toContain(manager.username);
      expect(scoped).not.toContain(outsider.username);

      await setPermissions(grantee.id, [{ action: 'read', groupId: null, subject: 'User' }]);
      expect(await readUsernames(await login(grantee.username))).toContain(outsider.username);
    });
  });

  // A grant is the only way a non-admin reaches `PATCH /instrument-records/:id`, since no base level
  // below admin holds `update` or `delete` on records.
  describe('PATCH /v1/instrument-records/:id with an update grant', () => {
    let editorHeaders: AuthHeaders;

    const patchRecord = (id: string, data: object) => {
      return request(editorHeaders, { method: 'PATCH', payload: { data }, url: `/v1/instrument-records/${id}` });
    };

    beforeAll(async () => {
      const editor = await createUser('STANDARD', [ownGroup.id]);
      await setPermissions(editor.id, [{ action: 'update', groupId: ownGroup.id, subject: 'InstrumentRecord' }]);
      editorHeaders = await login(editor.username);
    });

    // The write used to be scoped by the caller's `delete` rules rather than the `update` rules the
    // route is gated on, so a holder of `update` alone passed the guard and had every write refused.
    it('should let the holder edit a record in the group the grant names, without holding delete', async () => {
      const record = await createRecord(ownGroup.id);

      const response = await patchRecord(record.id, { score: 3 });

      expect(response.statusCode).toBe(200);
      const stored = await request(adminHeaders, { method: 'GET', url: `/v1/instrument-records/${record.id}` });
      expect(stored.json<InstrumentRecord>().data).toStrictEqual({ score: 3 });
    });

    // The lookup the payload is merged into is scoped as well. Before it was, an invalid payload for
    // another group's record answered 400 where an unknown id answers 404, which reported the id real.
    it('should answer an edit to a record outside the grant exactly as for one that does not exist', async () => {
      const record = await createRecord(foreignGroup.id);
      const invalid = { score: 'not a number' };

      const foreign = await patchRecord(record.id, invalid);
      const absent = await patchRecord('0'.repeat(24), invalid);

      expect(foreign.statusCode).toBe(absent.statusCode);
      expect(foreign.statusCode).toBe(404);
    });
  });

  // The import route answers with the rows it wrote, and used to find them by re-querying the
  // instrument with the request's optional `groupId` as the only filter, so omitting it returned every
  // group's records for that instrument to the lowest role, which holds no `read InstrumentRecord`.
  it('should answer an upload with only the records it wrote, never those of another group', async () => {
    await uploadRecords(foreignGroup.id, [`authorization-foreign-${randomUUID()}`]);
    const ownSubjectId = `authorization-own-${randomUUID()}`;

    const response = await request(standardHeaders, {
      method: 'POST',
      payload: { instrumentId, records: [{ data: { score: 1 }, date: new Date(), subjectId: ownSubjectId }] },
      url: '/v1/instrument-records/upload'
    });

    expect(response.statusCode).toBe(201);
    expect(response.json<InstrumentRecord[]>().map(({ subjectId }) => subjectId)).toStrictEqual([ownSubjectId]);
  });

  // The token a user who must reset their password is issued carries no permission but to read
  // themselves, so a client that ignores the web app's redirect to the reset page still reaches nothing.
  describe('a user who must reset their password', () => {
    let user: User;
    let headers: AuthHeaders;

    beforeAll(async () => {
      user = await createUser('GROUP_MANAGER', [ownGroup.id], { mustResetPassword: true });
      headers = await login(user.username);
    });

    it.each(['/v1/subjects', '/v1/sessions', '/v1/groups', '/v1/assignments'])(
      'should be refused GET %s by the api, not only by the router',
      async (url) => {
        expect((await request(headers, { method: 'GET', url })).statusCode).toBe(403);
      }
    );

    // `read User` is granted, because the reset itself is gated on it. `@RouteAccess` only checks the
    // subject type, so this route answers 200; what confines it is the rule's condition, applied by
    // `accessibleQuery`, which reduces the list to the one user asking.
    it('should read only their own account from the user list', async () => {
      const response = await request(headers, { method: 'GET', url: '/v1/users' });
      expect(response.statusCode).toBe(200);
      expect(response.json<User[]>().map(({ id }) => id)).toStrictEqual([user.id]);
    });
  });
});
