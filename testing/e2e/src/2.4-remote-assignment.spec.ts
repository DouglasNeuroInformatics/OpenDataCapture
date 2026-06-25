import { expect, test } from './helpers/fixtures';
import { RemoteAssignmentPage } from './pages/remote-assignment.page';

test.describe('remote assignment', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        'app',
        JSON.stringify({ state: { isDisclaimerAccepted: true, isWalkthroughComplete: true }, version: 1 })
      );
    });
  });

  test('should display the remote assignment page after starting a session', async ({ getPageModel, page }) => {
    const startSessionPage = await getPageModel('/session/start-session');
    await startSessionPage.sessionForm.waitFor({ state: 'visible' });
    await startSessionPage.selectIdentificationMethod('PERSONAL_INFO');
    await startSessionPage.fillSessionForm('RemoteTest', 'Subject', 'Male');
    await startSessionPage.submitForm();
    await expect(startSessionPage.successMessage).toBeVisible();

    await page.getByTestId('nav-button-/session/remote-assignment').click();
    await page.waitForURL('**/session/remote-assignment');
    const remoteAssignmentPage = new RemoteAssignmentPage(page);
    await expect(remoteAssignmentPage.pageHeader).toBeVisible();
    await expect(remoteAssignmentPage.pageHeader).toContainText('Remote Assignment');
    await expect(remoteAssignmentPage.instrumentShowcase).toBeVisible();
  });

  test('should create a remote assignment and display the result', async ({ getPageModel, page }) => {
    const startSessionPage = await getPageModel('/session/start-session');
    await startSessionPage.sessionForm.waitFor({ state: 'visible' });
    await startSessionPage.selectIdentificationMethod('PERSONAL_INFO');
    await startSessionPage.fillSessionForm('RemoteAssign', 'TestUser', 'Female');
    await startSessionPage.submitForm();
    await expect(startSessionPage.successMessage).toBeVisible();

    await page.getByTestId('nav-button-/session/remote-assignment').click();
    await page.waitForURL('**/session/remote-assignment');
    const remoteAssignmentPage = new RemoteAssignmentPage(page);
    await expect(remoteAssignmentPage.instrumentShowcase).toBeVisible();

    await remoteAssignmentPage.clickFirstInstrumentCard();

    const dialog = remoteAssignmentPage.createDialog;
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText('Create Remote Assignment');

    await remoteAssignmentPage.submitAssignmentForm();

    const assignmentLink = page.getByRole('link', { name: 'Assignment Link' });
    await expect(assignmentLink).toBeVisible({ timeout: 10_000 });

    const urlInput = page.locator('input[readonly]');
    await expect(urlInput).toBeVisible();
    const url = await urlInput.inputValue();
    expect(url).toMatch(/^https?:\/\/.+/);
  });
});
