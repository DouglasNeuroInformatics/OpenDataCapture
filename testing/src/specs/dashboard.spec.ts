import { expect, test } from '../support/fixtures';

test.describe('dashboard', () => {
  test('should display the dashboard header @smoke', async ({ getPageModel }) => {
    const dashboardPage = await getPageModel('/dashboard');
    await expect(dashboardPage.pageHeader).toBeVisible();
    await expect(dashboardPage.pageHeader).toContainText('Dashboard');
  });
});
