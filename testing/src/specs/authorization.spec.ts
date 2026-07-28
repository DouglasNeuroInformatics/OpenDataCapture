import { expect, test } from '../support/fixtures';

/** Sidebar destinations a GROUP_MANAGER gets but a STANDARD user must not. */
const GROUP_MANAGER_ONLY_ROUTES = ['/dashboard', '/datahub', '/group/manage', '/session/remote-assignment'] as const;

test.describe('authorization', () => {
  test('should give a group manager the management navigation @smoke', async ({ getPageModel, page }) => {
    await getPageModel('/dashboard');
    await expect(page.getByTestId('sidebar')).toBeVisible();
    for (const route of GROUP_MANAGER_ONLY_ROUTES) {
      await expect(page.getByTestId(`nav-button-${route}`)).toBeVisible();
    }
  });

  test.describe('standard user', () => {
    test.use({ actingRole: 'STANDARD' });

    test('should not expose management navigation', async ({ authenticateAs, page }) => {
      await authenticateAs('STANDARD');
      await page.goto('/session/start-session');

      await expect(page.getByTestId('sidebar')).toBeVisible();
      await expect(page.getByTestId('nav-button-/session/start-session')).toBeVisible();
      for (const route of GROUP_MANAGER_ONLY_ROUTES) {
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
