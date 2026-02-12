import { expect, test } from './helpers/fixtures';

test.describe('disclaimer', () => {
  test('should accept the disclaimer', async ({ getProjectAuth, page }) => {
    // Get the auth token
    const auth = await getProjectAuth();

    // Set localStorage to ensure disclaimer appears and set auth
    await page.addInitScript((accessToken) => {
      window.__PLAYWRIGHT_ACCESS_TOKEN__ = accessToken;
      // Set the app localStorage item to ensure disclaimer is not accepted
      localStorage.setItem('app', JSON.stringify({ state: { isDisclaimerAccepted: false }, version: 1 }));
    }, auth.accessToken);

    // Navigate to dashboard
    await page.goto('/dashboard');

    // Wait for the disclaimer dialog to appear
    const disclaimerDialog = page.getByRole('dialog', { name: 'Disclaimer' });
    await expect(disclaimerDialog).toBeVisible();

    // Click the accept disclaimer button
    const acceptButton = page.getByRole('button', { name: 'Accept' });
    await expect(acceptButton).toBeVisible();
    await acceptButton.click();

    // Verify the disclaimer dialog is no longer visible
    await expect(disclaimerDialog).not.toBeVisible();

    // Verify we're still on the dashboard
    const pageHeader = page.getByTestId('page-header');
    await expect(pageHeader).toBeVisible();
    await expect(pageHeader).toContainText('Dashboard');
  });
});
