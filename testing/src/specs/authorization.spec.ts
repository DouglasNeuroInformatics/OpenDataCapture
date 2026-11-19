import type { $CreateAssignmentData } from '@opendatacapture/schemas/assignment';
import type { APIRequestContext } from '@playwright/test';

import { expect, test } from '../support/fixtures';

// What each role may reach through the api itself, row scoping included, is asserted against a real
// database in `apps/api/test/suites/08-authorization.suite.ts`. This spec keeps what only the browser
// shows: the navigation each role is given and the routes it is kept out of.

const API = '/api/v1';

/** Sidebar destinations a GROUP_MANAGER gets but a STANDARD user must not. */
// `/group/email-templates` is deliberately absent: its nav item only renders when mail is
// enabled instance-wide, which it is not for this suite. `mail.spec.ts` covers it there.
const GROUP_MANAGER_ONLY_ROUTES = [
  '/dashboard',
  '/datahub/subjects',
  '/datahub/instruments',
  '/group/manage',
  '/session/remote-assignment'
] as const;

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
  test('should give a group manager the management navigation, and none of the admin navigation', async ({
    getPageModel,
    page
  }) => {
    const dashboardPage = await getPageModel('/dashboard');
    // Bulk remote assignments is enabled by default, which nests group links under a collapsible
    // "Group Actions" menu — expand it so the child nav buttons become visible.
    await dashboardPage.expandNavGroup('Group Actions');
    // The datahub is likewise a collapsible group, over its subject and instrument views.
    await dashboardPage.expandNavGroup('Data Hub');
    for (const route of GROUP_MANAGER_ONLY_ROUTES) {
      await expect(page.getByTestId(`nav-button-${route}`)).toBeVisible();
    }
    for (const route of ADMIN_ONLY_ROUTES) {
      await expect(page.getByTestId(`nav-button-${route}`)).toHaveCount(0);
    }
  });

  // Audit logs is the one admin-only route whose client-side render is itself blocked for a
  // non-admin role, because its loader reads an endpoint gated on `manage all`. The other admin
  // routes render for a non-admin who navigates to them directly; what stops them is the api
  // refusing the requests those screens fire, which the api's integration suite asserts for both
  // non-admin roles.
  test('should block a group manager from audit logs', async ({ authenticateAs, page }) => {
    await authenticateAs('GROUP_MANAGER');
    await page.goto('/admin/audit/logs');
    await expect(page.getByRole('heading', { name: '403 - Forbidden' })).toBeVisible();
  });

  for (const role of ['ADMIN', 'GROUP_MANAGER', 'STANDARD'] as const) {
    test(`should let a ${role} user reach every unrestricted route`, async ({ authenticateAs, page }) => {
      await authenticateAs(role);
      for (const route of SHARED_ROUTES) {
        await page.goto(route);
        await expect(page).toHaveURL(route);
      }
    });
  }

  // Uses `authenticateAs` + a raw goto rather than `getPageModel`, which asserts it landed on the
  // requested route -- here the point is partly that it does not.
  test('should give a standard user no management navigation, and send them away from the dashboard', async ({
    authenticateAs,
    page
  }) => {
    await authenticateAs('STANDARD');
    await page.goto('/session/start-session');

    await expect(page.getByTestId('sidebar')).toBeVisible();
    await expect(page.getByTestId('nav-button-/session/start-session')).toBeVisible();
    for (const route of [...GROUP_MANAGER_ONLY_ROUTES, ...ADMIN_ONLY_ROUTES]) {
      await expect(page.getByTestId(`nav-button-${route}`)).toHaveCount(0);
    }

    await page.goto('/dashboard');
    await expect(page).toHaveURL('/session/start-session');
  });
});

/** `POST /assignments` as the holder of the given token, expiring tomorrow, with the raw response. */
function createAssignment(request: APIRequestContext, token: string, data: Omit<$CreateAssignmentData, 'expiresAt'>) {
  return request.post(`${API}/assignments`, {
    data: { ...data, expiresAt: new Date(Date.now() + 86_400_000) },
    headers: { Authorization: `Bearer ${token}` }
  });
}

test.describe('server-side authorization', () => {
  // Kept here rather than in the api's integration suite because the assignment is really pushed to
  // the gateway, which only this tier runs.
  test('should let an administrator file an assignment under no group, which the web client sends without one selected', async ({
    adminToken,
    api,
    apiRequestContext,
    uniqueId
  }) => {
    const { subjectId } = await api.createSession(null, { id: `Ungrouped${uniqueId}` });

    const response = await createAssignment(apiRequestContext, adminToken, {
      instrumentId: await api.findInstrumentId('FORM'),
      subjectId
    });

    expect(response.status()).toBe(201);
    const assignments = await api.findAssignments(subjectId);
    expect(assignments).toMatchObject([{ groupId: null }]);

    // Cancelling removes the row from the gateway, so the rest of the run is not synchronizing it.
    await apiRequestContext.patch(`${API}/assignments/${assignments[0]!.id}`, {
      data: { status: 'CANCELED' },
      headers: { Authorization: `Bearer ${adminToken}` }
    });
  });
});
