import type { Permissions } from '@opendatacapture/schemas/core';
import type { InstrumentInfo } from '@opendatacapture/schemas/instrument';
import type { InstrumentRecord, UploadInstrumentRecordsData } from '@opendatacapture/schemas/instrument-records';
import type { User } from '@opendatacapture/schemas/user';
import type { APIRequestContext, APIResponse } from '@playwright/test';

import { ApiClient } from '../support/api-client';
import { expect, test } from '../support/fixtures';

import type { Role } from '../support/types';

const API = '/api/v1';

const NON_ADMIN_ROLES = ['GROUP_MANAGER', 'STANDARD'] as const satisfies Role[];

type PrivilegedRequest = {
  /** The admin screen a non-admin role can render by navigating to it directly. */
  screen: string;
  /** `userId` is a freshly seeded throwaway, so an unexpected success touches nothing another spec reads. */
  send: (
    request: APIRequestContext,
    options: { headers: { Authorization: string }; userId: string }
  ) => Promise<APIResponse>;
  /** Completes the sentence "must not be able to ...". */
  what: string;
};

/**
 * Every request the controls on those screens fire. Each is gated by a `@RouteAccess` action no
 * non-admin base permission level grants, so each must be refused outright rather than scoped.
 */
const PRIVILEGED_REQUESTS: PrivilegedRequest[] = [
  {
    screen: '/admin/users',
    send: (request, { headers }) =>
      request.post(`${API}/users`, {
        data: {
          basePermissionLevel: 'ADMIN',
          firstName: 'Escalation',
          groupIds: [],
          lastName: 'Probe',
          password: 'DataCapture2025_Probe',
          username: 'escalation-probe'
        },
        headers
      }),
    what: 'create an administrator'
  },
  {
    screen: '/admin/users',
    send: (request, { headers, userId }) =>
      request.patch(`${API}/users/${userId}`, { data: { basePermissionLevel: 'ADMIN' }, headers }),
    what: "raise another user's permission level"
  },
  {
    screen: '/admin/users',
    send: (request, { headers, userId }) => request.delete(`${API}/users/${userId}`, { headers }),
    what: 'delete a user'
  },
  {
    // Gated on `manage all` rather than `update User`: an `update User` grant is one of the things
    // this route hands out, so holding one must not be enough to reach it.
    screen: '/admin/users/$userId',
    send: (request, { headers, userId }) =>
      request.put(`${API}/users/${userId}/permissions`, {
        data: { permissions: [{ action: 'manage', groupId: null, subject: 'all' }] },
        headers
      }),
    what: 'grant another user a permission'
  },
  {
    // Both screens save through the same endpoint (`useUpdateSetupStateMutation`). The value sent
    // is the seeded one, so were this ever to succeed it would fail the assertion without also
    // changing instance-wide state under the admin settings spec.
    screen: '/admin/settings and /admin/branding',
    send: (request, { headers }) =>
      request.patch(`${API}/setup`, { data: { isExperimentalFeaturesEnabled: false }, headers }),
    what: 'change instance-wide settings'
  },
  {
    // `POST /v1/groups` used to be declared `create Group`, which every group manager passes: the
    // guard sees the subject type, and their `manage Group` rule's condition is invisible to it.
    screen: '/admin/groups',
    send: (request, { headers, userId }) =>
      request.post(`${API}/groups`, { data: { name: `Escalation Probe ${userId}`, type: 'CLINICAL' }, headers }),
    what: 'create a group'
  },
  {
    screen: '/admin/instrument-repos',
    send: (request, { headers }) =>
      request.post(`${API}/instrument-repos`, { data: { url: 'https://github.com/example/example' }, headers }),
    what: 'import an instrument repository'
  },
  {
    screen: '/admin/audit/logs',
    send: (request, { headers }) => request.get(`${API}/audit/logs`, { headers }),
    what: 'read the audit log'
  },
  {
    // The response omits the password, but the host, username and sender address are still the
    // institution's outbound mail identity.
    screen: '/admin/mail',
    send: (request, { headers }) => request.get(`${API}/mail/settings`, { headers }),
    what: 'read the mail configuration'
  },
  {
    screen: '/admin/mail',
    send: (request, { headers }) =>
      request.patch(`${API}/mail/settings`, { data: { newUserEmailTemplate: { body: {}, subject: {} } }, headers }),
    what: 'rewrite the mail configuration or templates'
  },
  {
    // The one request that opens an outbound SMTP connection to a caller-supplied host using the
    // stored credential.
    screen: '/admin/mail',
    send: (request, { headers }) => request.post(`${API}/mail/test`, { data: {}, headers }),
    what: 'probe a mail server with the stored credential'
  }
];

/** Sidebar destinations a GROUP_MANAGER gets but a STANDARD user must not. */
// `/group/email-templates` is deliberately absent: its nav item only renders when mail is
// enabled instance-wide, which it is not for this suite. `mail.spec.ts` covers it there.
const GROUP_MANAGER_ONLY_ROUTES = ['/dashboard', '/datahub', '/group/manage', '/session/remote-assignment'] as const;

/** Sidebar destinations behind `can('manage', 'all')`, gated to ADMIN alone. */
const ADMIN_ONLY_ROUTES = [
  '/admin/groups',
  '/admin/users',
  '/admin/settings',
  '/admin/branding',
  '/admin/instrument-repos',
  '/admin/audit/logs',
  // Only asserted negatively (hidden from non-admins), which holds whether or not mail is on.
  '/admin/mail'
] as const;

/** Routes with no role gating at all -- reachable by every authenticated role. */
const SHARED_ROUTES = ['/user', '/instruments/accessible-instruments'] as const;

test.describe('authorization', () => {
  test('should give a group manager the management navigation @smoke', async ({ getPageModel, page }) => {
    const dashboardPage = await getPageModel('/dashboard');
    // Bulk remote assignments is enabled by default, which nests group links under a collapsible
    // "Group Actions" menu — expand it so the child nav buttons become visible.
    await dashboardPage.expandNavGroup('Group Actions');
    for (const route of GROUP_MANAGER_ONLY_ROUTES) {
      await expect(page.getByTestId(`nav-button-${route}`)).toBeVisible();
    }
  });

  test('should not expose admin-only navigation to a group manager', async ({ getPageModel, page }) => {
    await getPageModel('/dashboard');
    for (const route of ADMIN_ONLY_ROUTES) {
      await expect(page.getByTestId(`nav-button-${route}`)).toHaveCount(0);
    }
  });

  test('should let a group manager reach their own group management page', async ({ authenticateAs, page }) => {
    await authenticateAs('GROUP_MANAGER');
    await page.goto('/group/manage');
    await expect(page).toHaveURL('/group/manage');
  });

  // Audit logs is the one admin-only route whose client-side render is itself blocked for a
  // non-admin role, because its loader reads an endpoint gated on `manage all`. The other admin
  // routes render for a non-admin who navigates to them directly; what stops them is the API
  // refusing the requests those screens fire, asserted below under "server-side enforcement".
  test.describe('non-admin roles', () => {
    for (const role of ['GROUP_MANAGER', 'STANDARD'] as const) {
      test(`should block a ${role} user from audit logs`, async ({ authenticateAs, page }) => {
        await authenticateAs(role);
        await page.goto('/admin/audit/logs');
        await expect(page.getByRole('heading', { name: '403 - Forbidden' })).toBeVisible();
      });
    }
  });

  for (const role of ['ADMIN', 'GROUP_MANAGER', 'STANDARD'] as const) {
    test.describe(`${role} on unrestricted routes`, () => {
      test.use({ actingRole: role });

      for (const route of SHARED_ROUTES) {
        test(`should let a ${role} user reach ${route}`, async ({ getPageModel }) => {
          await getPageModel(route);
        });
      }
    });
  }

  test.describe('standard user', () => {
    test.use({ actingRole: 'STANDARD' });

    test('should not expose management navigation', async ({ authenticateAs, page }) => {
      await authenticateAs('STANDARD');
      await page.goto('/session/start-session');

      await expect(page.getByTestId('sidebar')).toBeVisible();
      await expect(page.getByTestId('nav-button-/session/start-session')).toBeVisible();
      for (const route of [...GROUP_MANAGER_ONLY_ROUTES, ...ADMIN_ONLY_ROUTES]) {
        await expect(page.getByTestId(`nav-button-${route}`)).toHaveCount(0);
      }
    });

    // Uses `authenticateAs` + a raw goto rather than `getPageModel`, which asserts it landed on the
    // requested route -- here the whole point is that it does not.
    test('should be redirected away from the dashboard', async ({ authenticateAs, page }) => {
      await authenticateAs('STANDARD');
      await page.goto('/dashboard');
      await expect(page).toHaveURL('/session/start-session');
    });

    test('should be redirected away from remote assignment', async ({ authenticateAs, page }) => {
      await authenticateAs('STANDARD');
      await page.goto('/session/remote-assignment');
      await expect(page).toHaveURL('/session/start-session');
    });

    // `GET /v1/instruments/info` is gated on `read Instrument`, which a standard user holds, but
    // resolving `subjectId` reads instrument records, which they do not. Scoping that lookup to the
    // caller must answer with an empty list rather than failing the request.
    //
    // The defect this endpoint was changed for -- a mongodb $lookup exceeding its 100 MiB per-document
    // ceiling once one instrument holds ~182,000 records -- cannot be reproduced at this tier. That
    // gap is deliberate; the evidence for it is in the PR, measured against a live instance.
    test('should answer the subject-filtered instrument list for a caller who may read no records', async ({
      apiRequestContext,
      roleAccount
    }) => {
      const { accessToken } = await roleAccount('STANDARD');

      const response = await apiRequestContext.get('/api/v1/instruments/info?subjectId=any-subject', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      expect(response.status()).toBe(200);
      expect(await response.json()).toStrictEqual([]);
    });
  });

  // The populated case -- a group manager reaching /datahub/$subjectId/table and picking an
  // instrument from the list -- is covered end to end by `instrument-completion.spec.ts`, which
  // administers one first so the list has something in it. This case only pins the contract for a
  // subject with no visible records: an empty list, not an error.
  test('should answer the subject-filtered instrument list for a group manager rather than erroring', async ({
    apiRequestContext,
    roleAccount
  }) => {
    const { accessToken } = await roleAccount('GROUP_MANAGER');

    const response = await apiRequestContext.get('/api/v1/instruments/info?subjectId=any-subject', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    expect(response.status()).toBe(200);
    expect(await response.json()).toStrictEqual([]);
  });
});

/** A real, already-interpretable bundle: the first seeded instrument's own compiled source. */
async function readSeededBundle(request: APIRequestContext, token: string): Promise<string> {
  const headers = { Authorization: `Bearer ${token}` };
  const [instrument] = (await (await request.get(`${API}/instruments/info`, { headers })).json()) as { id: string }[];
  const container = await request.get(`${API}/instruments/bundle/${instrument!.id}`, { headers });
  expect(container.ok()).toBe(true);
  return ((await container.json()) as { bundle: string }).bundle;
}

/** The id of the latest edition of a seeded instrument, by its internal name. */
async function findInstrumentId(request: APIRequestContext, token: string, name: string): Promise<string> {
  const response = await request.get(`${API}/instruments/info`, { headers: { Authorization: `Bearer ${token}` } });
  expect(response.ok()).toBe(true);
  const instrument = ((await response.json()) as InstrumentInfo[]).find(
    (info) => info.kind === 'FORM' && info.internal.name === name
  );
  if (!instrument) {
    throw new Error(`Instrument '${name}' is not in the seeded catalog`);
  }
  return instrument.id;
}

/** One record satisfying the happiness questionnaire's validation schema, for the given subject. */
function happinessRecord(subjectId: string): UploadInstrumentRecordsData['records'][number] {
  return {
    data: { isSatisfiedOverall: true, personalLifeSatisfaction: 8, professionalLifeSatisfaction: 7 },
    date: new Date('2024-01-15'),
    subjectId
  };
}

/** `POST /instrument-records/upload` as the holder of the given token, with the raw response. */
function uploadRecord(request: APIRequestContext, token: string, data: UploadInstrumentRecordsData) {
  return request.post(`${API}/instrument-records/upload`, { data, headers: { Authorization: `Bearer ${token}` } });
}

/** The user list `/admin/users` renders, read with the given user's own token. */
async function readUsernames(request: APIRequestContext, token: string): Promise<string[]> {
  const response = await request.get(`${API}/users`, { headers: { Authorization: `Bearer ${token}` } });
  expect(response.ok()).toBe(true);
  return ((await response.json()) as User[]).map(({ username }) => username);
}

// The sidebar hiding an admin link is cosmetic: a non-admin who navigates to `/admin/users`,
// `/admin/settings`, `/admin/branding`, `/admin/groups` or `/group/manage` directly gets the real
// screen (#1470). What makes that harmless is the API, so these tests drive it directly rather than
// through the UI -- they are the reason those screens are not treated as an access-control defect.
test.describe('server-side authorization', () => {
  for (const role of NON_ADMIN_ROLES) {
    test(`should refuse every privileged request a ${role} user could fire from an admin screen`, async ({
      api,
      apiRequestContext,
      roleAccount
    }) => {
      const group = await api.createGroup();
      const { user } = await api.createUser({ groupIds: [group.id] });
      const { accessToken } = await roleAccount(role);
      const headers = { Authorization: `Bearer ${accessToken}` };

      for (const { screen, send, what } of PRIVILEGED_REQUESTS) {
        const response = await send(apiRequestContext, { headers, userId: user.id });
        expect.soft(response.status(), `a ${role} user must not be able to ${what} from ${screen}`).toBe(403);
      }
    });
  }

  // The requests above are refused because no base level grants a `User` write. An administrator can
  // grant one, and each request here would then end with the grantee holding `manage all` at their
  // next login -- by promoting themselves, joining every group, or logging in as an account whose
  // password they chose.
  test('should refuse every write to a user from a group manager granted `manage User`', async ({
    api,
    apiRequestContext,
    uniqueId
  }) => {
    const group = await api.createGroup({ name: `Grantee Group ${uniqueId}` });
    const otherGroup = await api.createGroup({ name: `Other Group ${uniqueId}` });
    const { credentials, user: grantee } = await api.createUser({ groupIds: [group.id] });
    const { user: teammateAdmin } = await api.createUser({ basePermissionLevel: 'ADMIN', groupIds: [group.id] });
    await api.setUserPermissions(grantee.id, [{ action: 'manage', groupId: group.id, subject: 'User' }]);
    const headers = { Authorization: `Bearer ${await ApiClient.login(apiRequestContext, credentials)}` };
    const password = `chosen-oyster-lantern-${uniqueId}`;

    const attempts: { [what: string]: () => Promise<APIResponse> } = {
      'create an administrator': () =>
        apiRequestContext.post(`${API}/users`, {
          data: {
            basePermissionLevel: 'ADMIN',
            firstName: 'Escalation',
            groupIds: [],
            lastName: 'Probe',
            password,
            username: `probe${uniqueId}`
          },
          headers
        }),
      'delete an administrator in their group': () =>
        apiRequestContext.delete(`${API}/users/${teammateAdmin.id}`, { headers }),
      'join a group they do not manage': () =>
        apiRequestContext.patch(`${API}/users/${grantee.id}`, {
          data: { groupIds: [group.id, otherGroup.id] },
          headers
        }),
      'raise their own permission level': () =>
        apiRequestContext.patch(`${API}/users/${grantee.id}`, {
          data: { basePermissionLevel: 'ADMIN' },
          headers
        }),
      "set an administrator's password": () =>
        apiRequestContext.patch(`${API}/users/${teammateAdmin.id}`, {
          data: { mustResetPassword: false, password },
          headers
        })
    };

    for (const [what, send] of Object.entries(attempts)) {
      expect.soft((await send()).status(), `a grantee must not be able to ${what}`).toBe(403);
    }
    expect(await api.findUserById(grantee.id)).toMatchObject({
      basePermissionLevel: 'GROUP_MANAGER',
      groupIds: [group.id]
    });
  });

  // Every route that writes a user is admin-only, so an administrator removing their own access could
  // leave no account able to reach them again. Seeded rather than the shared admin, so a regression
  // loses a throwaway account instead of the one every other spec logs in as.
  test('should refuse an administrator deleting or disabling their own account', async ({ api, apiRequestContext }) => {
    const { credentials, user } = await api.createUser({ basePermissionLevel: 'ADMIN' });
    const headers = { Authorization: `Bearer ${await ApiClient.login(apiRequestContext, credentials)}` };

    const disabled = await apiRequestContext.patch(`${API}/users/${user.id}`, { data: { disabled: true }, headers });
    const deleted = await apiRequestContext.delete(`${API}/users/${user.id}`, { headers });

    expect.soft(disabled.status(), 'an administrator must not be able to disable themselves').toBe(403);
    expect.soft(deleted.status(), 'an administrator must not be able to delete themselves').toBe(403);
    expect((await api.findUserById(user.id)).disabled).not.toBe(true);
  });

  // The playground uploads a bundle with a token minted by `GET /auth/create-instrument-token`, and
  // that token is the only non-interactive caller of `POST /instruments`. Nothing else in the suite
  // exercises it, which is how #1392 severed the two: the route moved to `manage Instrument` while
  // the token still carried `create`, and every upload answered 403.
  test.describe('granular instrument token', () => {
    test('should let an administrator mint a token their own bundle upload is accepted with', async ({
      adminToken,
      apiRequestContext
    }) => {
      const minted = await apiRequestContext.get(`${API}/auth/create-instrument-token`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      expect(minted.status()).toBe(200);
      const { accessToken } = (await minted.json()) as { accessToken: string };

      // Re-posting a seeded instrument's own bundle. The conflict is the point: reaching the
      // duplicate check means the guard admitted the token and the bundle was really interpreted
      // and validated server-side, which a 403 would have cut short.
      const response = await apiRequestContext.post(`${API}/instruments`, {
        data: { bundle: await readSeededBundle(apiRequestContext, adminToken) },
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      expect(response.status(), 'a minted token must be accepted by the instrument create route').toBe(409);
    });

    test('should not mint a token for a group manager, whose create grant is for series instruments', async ({
      apiRequestContext,
      roleAccount
    }) => {
      const { accessToken } = await roleAccount('GROUP_MANAGER');

      const response = await apiRequestContext.get(`${API}/auth/create-instrument-token`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      expect(response.status()).toBe(403);
    });
  });

  // A group manager holds `manage Group` for their own groups, and `@RouteAccess` sees only the
  // subject type, so the guard lets these through and the row scoping in `GroupsService` is the
  // whole check. Asserted by effect rather than by status code for that reason.
  test('should not let a group manager rename a group they do not belong to', async ({
    api,
    apiRequestContext,
    roleAccount,
    uniqueId
  }) => {
    const group = await api.createGroup({ name: `Foreign Group ${uniqueId}` });
    const { accessToken } = await roleAccount('GROUP_MANAGER');

    const response = await apiRequestContext.patch(`${API}/groups/${group.id}`, {
      data: { name: `Hijacked Group ${uniqueId}` },
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    expect(response.ok()).toBe(false);
    expect((await api.findGroupById(group.id)).name).toBe(group.name);
  });

  test('should not let a group manager delete a group they do not belong to', async ({
    api,
    apiRequestContext,
    roleAccount,
    uniqueId
  }) => {
    const group = await api.createGroup({ name: `Foreign Group ${uniqueId}` });
    const { accessToken } = await roleAccount('GROUP_MANAGER');

    const response = await apiRequestContext.delete(`${API}/groups/${group.id}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    expect(response.ok()).toBe(false);
    expect((await api.findGroupById(group.id)).id).toBe(group.id);
  });

  // `/admin/users` renders a populated table for a non-admin, which is only acceptable because the
  // rows it can read are the ones it may already see elsewhere in the app.
  test('should scope the user list a group manager reads to their own group', async ({
    api,
    apiRequestContext,
    uniqueId
  }) => {
    const group = await api.createGroup({ name: `Scoped Group ${uniqueId}` });
    const outsiderGroup = await api.createGroup({ name: `Outsider Group ${uniqueId}` });
    const { credentials } = await api.createUser({ groupIds: [group.id] });
    const { user: teammate } = await api.createUser({ basePermissionLevel: 'STANDARD', groupIds: [group.id] });
    const { user: outsider } = await api.createUser({ groupIds: [outsiderGroup.id] });

    const usernames = await readUsernames(apiRequestContext, await ApiClient.login(apiRequestContext, credentials));

    expect(usernames).toContain(teammate.username);
    expect(usernames).not.toContain(outsider.username);
  });

  test('should limit the user list a standard user reads to their own account', async ({
    api,
    apiRequestContext,
    uniqueId
  }) => {
    const group = await api.createGroup({ name: `Standard Group ${uniqueId}` });
    const { credentials, user } = await api.createUser({ basePermissionLevel: 'STANDARD', groupIds: [group.id] });
    await api.createUser({ groupIds: [group.id] });

    const usernames = await readUsernames(apiRequestContext, await ApiClient.login(apiRequestContext, credentials));

    expect(usernames).toStrictEqual([user.username]);
  });

  // Row-level scoping is not observable in the api's own tests, whose model is mocked, so the grant
  // an admin confines to one group from `/admin/users/$userId` is exercised here against real rows.
  test('should confine a granted permission to the group it names, where an unscoped one reads every group', async ({
    api,
    apiRequestContext,
    uniqueId
  }) => {
    const group = await api.createGroup({ name: `Granted Group ${uniqueId}` });
    const outsiderGroup = await api.createGroup({ name: `Ungranted Group ${uniqueId}` });
    const { credentials, user } = await api.createUser({ basePermissionLevel: 'STANDARD', groupIds: [group.id] });
    const { user: teammate } = await api.createUser({ groupIds: [group.id] });
    const { user: outsider } = await api.createUser({ groupIds: [outsiderGroup.id] });

    // Permissions are signed into the token at login, so every grant needs a fresh one.
    const usernamesGranted = async (permissions: Permissions) => {
      await api.setUserPermissions(user.id, permissions);
      return readUsernames(apiRequestContext, await ApiClient.login(apiRequestContext, credentials));
    };

    const scoped = await usernamesGranted([{ action: 'read', groupId: group.id, subject: 'User' }]);
    expect(scoped).toContain(teammate.username);
    expect(scoped).not.toContain(outsider.username);

    const unscoped = await usernamesGranted([{ action: 'read', groupId: null, subject: 'User' }]);
    expect(unscoped).toContain(outsider.username);
  });

  test('should refuse a grant confined to a group the user does not belong to', async ({ api, uniqueId }) => {
    const group = await api.createGroup({ name: `Member Group ${uniqueId}` });
    const otherGroup = await api.createGroup({ name: `Non-member Group ${uniqueId}` });
    const { user } = await api.createUser({ groupIds: [group.id] });

    await expect(
      api.setUserPermissions(user.id, [{ action: 'read', groupId: otherGroup.id, subject: 'User' }])
    ).rejects.toThrow(/got 400/);
  });

  test('should ignore permissions sent through a profile update, so only the permissions route can grant', async ({
    adminToken,
    api,
    apiRequestContext
  }) => {
    const group = await api.createGroup();
    const { user } = await api.createUser({ groupIds: [group.id] });

    const response = await apiRequestContext.patch(`${API}/users/${user.id}`, {
      data: { additionalPermissions: [{ action: 'manage', groupId: null, subject: 'all' }] },
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    expect(response.ok()).toBe(true);
    expect((await api.findUserById(user.id)).additionalPermissions).toStrictEqual([]);
  });

  test('should drop a grant confined to a group the user is removed from, and keep an unscoped one', async ({
    api,
    uniqueId
  }) => {
    const leavingGroup = await api.createGroup({ name: `Leaving Group ${uniqueId}` });
    const stayingGroup = await api.createGroup({ name: `Staying Group ${uniqueId}` });
    const { user } = await api.createUser({ groupIds: [leavingGroup.id, stayingGroup.id] });
    await api.setUserPermissions(user.id, [
      { action: 'read', groupId: leavingGroup.id, subject: 'User' },
      { action: 'create', groupId: null, subject: 'Instrument' }
    ]);

    const updated = await api.updateUser(user.id, { groupIds: [stayingGroup.id] });

    expect(updated.additionalPermissions).toStrictEqual([{ action: 'create', groupId: null, subject: 'Instrument' }]);
  });

  // The import route answers with the rows it wrote, and used to find them by re-querying the
  // instrument with the request's optional `groupId` as the only filter. Omitting `groupId` therefore
  // returned every group's records for that instrument to the lowest role, which `create
  // InstrumentRecord` admits and which holds no `read InstrumentRecord` rule at all.
  test('should answer an upload with only the records it wrote, never those of another group', async ({
    api,
    apiRequestContext,
    roleAccount,
    uniqueId
  }) => {
    const { accessToken: adminToken } = await roleAccount('ADMIN');
    const { accessToken } = await roleAccount('STANDARD');
    const foreignGroup = await api.createGroup({ name: `Foreign Group ${uniqueId}` });
    const instrumentId = await findInstrumentId(apiRequestContext, adminToken, 'DNP_HAPPINESS_QUESTIONNAIRE');
    const foreignSubjectId = `Foreign${uniqueId}`;
    const ownSubjectId = `Own${uniqueId}`;

    const seeded = await uploadRecord(apiRequestContext, adminToken, {
      groupId: foreignGroup.id,
      instrumentId,
      records: [happinessRecord(foreignSubjectId)]
    });
    expect(seeded.status()).toBe(201);

    const response = await uploadRecord(apiRequestContext, accessToken, {
      instrumentId,
      records: [happinessRecord(ownSubjectId)]
    });

    expect(response.status()).toBe(201);
    const subjectIds = ((await response.json()) as InstrumentRecord[]).map((record) => record.subjectId);
    expect(subjectIds).toStrictEqual([ownSubjectId]);
  });
});
