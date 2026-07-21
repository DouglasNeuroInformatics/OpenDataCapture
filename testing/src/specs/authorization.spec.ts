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
  });
});
