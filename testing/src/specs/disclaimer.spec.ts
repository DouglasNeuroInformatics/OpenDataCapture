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

  test('should log the user out when declining, so a user cannot use the app without accepting', async ({
    api,
    getPageModel,
    page
  }) => {
    // Logging in through the real UI form (rather than `getPageModel`, which injects the token via
    // `page.addInitScript`) matters here: an init script re-runs on every navigation, including the
    // hard reload declining triggers, so it would silently re-authenticate the page and mask the
    // very thing this test checks. A brand-new browser context also defaults to
    // `isDisclaimerAccepted: false` in-code, so the dialog appears without needing `appState`.
    const group = await api.createGroup();
    const { credentials } = await api.createUser({ groupIds: [group.id] });

    const loginPage = await getPageModel('/auth/login');
    await loginPage.fillLoginForm(credentials);

    const dialog = page.getByRole('dialog', { name: 'Disclaimer' });
    await expect(dialog).toBeVisible();
    await page.getByRole('button', { name: 'Decline' }).click();

    await expect(page).toHaveURL('/auth/login');

    // Nothing set isDisclaimerAccepted, so signing back in shows the dialog again.
    await loginPage.fillLoginForm(credentials);
    await expect(page.getByRole('dialog', { name: 'Disclaimer' })).toBeVisible();
  });
});
