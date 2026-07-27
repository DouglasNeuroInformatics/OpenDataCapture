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
    // Both screens save through the same endpoint (`useUpdateSetupStateMutation`). The value sent
    // is the seeded one, so were this ever to succeed it would fail the assertion without also
    // changing instance-wide state under the admin settings spec.
    screen: '/admin/settings and /admin/branding',
    send: (request, { headers }) =>
      request.patch(`${API}/setup`, { data: { isExperimentalFeaturesEnabled: false }, headers }),
    what: 'change instance-wide settings'
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
  }
];

/** Sidebar destinations a GROUP_MANAGER gets but a STANDARD user must not. */
const GROUP_MANAGER_ONLY_ROUTES = ['/dashboard', '/datahub', '/group/manage', '/session/remote-assignment'] as const;

/** Sidebar destinations behind `can('manage', 'all')`, gated to ADMIN alone. */
const ADMIN_ONLY_ROUTES = [
  '/admin/groups',
  '/admin/users',
  '/admin/settings',
  '/admin/branding',
  '/admin/instrument-repos',
  '/admin/audit/logs'
] as const;

/** Routes with no role gating at all -- reachable by every authenticated role. */
const SHARED_ROUTES = ['/user', '/instruments/accessible-instruments'] as const;

test.describe('authorization', () => {
  test('should give a group manager the management navigation @smoke', async ({ getPageModel, page }) => {
    await getPageModel('/dashboard');
    await expect(page.getByTestId('sidebar')).toBeVisible();
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
  });
});

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
// `POST /v1/groups` is the one privileged request a group manager is wrongly allowed (#1468); it is
// left out of the table below rather than asserted, so the suite does not lock that in.
test.describe('server-side authorization', () => {
  for (const role of NON_ADMIN_ROLES) {
    test(`should refuse every privileged request a ${role} user could fire from an admin screen`, async ({
      api,
      apiRequestContext,
      roleToken
    }) => {
      const group = await api.createGroup();
      const { user } = await api.createUser({ groupIds: [group.id] });
      const headers = { Authorization: `Bearer ${await roleToken(role)}` };

      for (const { screen, send, what } of PRIVILEGED_REQUESTS) {
        const response = await send(apiRequestContext, { headers, userId: user.id });
        expect.soft(response.status(), `a ${role} user must not be able to ${what} from ${screen}`).toBe(403);
      }
    });
  }

  // A group manager holds `manage Group` for their own groups, and `@RouteAccess` sees only the
  // subject type, so the guard lets these through and the row scoping in `GroupsService` is the
  // whole check. Asserted by effect rather than by status code for that reason.
  test('should not let a group manager rename a group they do not belong to', async ({
    api,
    apiRequestContext,
    roleToken,
    uniqueId
  }) => {
    const group = await api.createGroup({ name: `Foreign Group ${uniqueId}` });

    const response = await apiRequestContext.patch(`${API}/groups/${group.id}`, {
      data: { name: `Hijacked Group ${uniqueId}` },
      headers: { Authorization: `Bearer ${await roleToken('GROUP_MANAGER')}` }
    });

    expect(response.ok()).toBe(false);
    expect((await api.findGroupById(group.id)).name).toBe(group.name);
  });

  test('should not let a group manager delete a group they do not belong to', async ({
    api,
    apiRequestContext,
    roleToken,
    uniqueId
  }) => {
    const group = await api.createGroup({ name: `Foreign Group ${uniqueId}` });

    const response = await apiRequestContext.delete(`${API}/groups/${group.id}`, {
      headers: { Authorization: `Bearer ${await roleToken('GROUP_MANAGER')}` }
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
});
