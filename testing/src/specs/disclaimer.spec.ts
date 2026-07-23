import { expect, test } from '../support/fixtures';

// Land on the dashboard with the disclaimer not yet accepted so the dialog appears.
test.use({ appState: { isDisclaimerAccepted: false, isWalkthroughComplete: true } });

test.describe('disclaimer', () => {
  test('should accept the disclaimer', async ({ getPageModel, page }) => {
    const dashboardPage = await getPageModel('/dashboard');

    const dialog = page.getByRole('dialog', { name: 'Disclaimer' });
    await expect(dialog).toBeVisible();
    await page.getByRole('button', { name: 'Accept' }).click();
    await expect(dialog).not.toBeVisible();

    await expect(dashboardPage.pageHeader).toContainText('Dashboard');
  });
});
