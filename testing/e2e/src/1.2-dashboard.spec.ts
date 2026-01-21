import { expect, test } from './helpers/fixtures';

test.describe('dashboard', () => {
  test.beforeEach(async ({ login, page }) => {
    await login();
    await expect(page).toHaveURL('/dashboard');
  });

  test('should display the dashboard header', async ({ getPageModel }) => {
    const dashboardPage = getPageModel('/dashboard');
    await expect(dashboardPage.pageHeader).toBeVisible();
    await expect(dashboardPage.pageHeader).toContainText('Dashboard');
  });
});
