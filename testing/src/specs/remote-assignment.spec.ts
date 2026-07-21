import { RemoteAssignmentPage } from '../pages/_app/session/remote-assignment.page';
import { expect, test } from '../support/fixtures';

import type { GetPageModel } from '../support/fixtures';

async function startSession(getPageModel: GetPageModel, firstName: string, lastName: string, sex: string) {
  const startSessionPage = await getPageModel('/session/start-session');
  await startSessionPage.sessionForm.waitFor({ state: 'visible' });
  await startSessionPage.selectIdentificationMethod('PERSONAL_INFO');
  await startSessionPage.fillSessionForm(firstName, lastName, sex);
  await startSessionPage.submitForm();
  await expect(startSessionPage.successMessage).toBeVisible();
}

test.describe('remote assignment', () => {
  test('should display the remote assignment page after starting a session @smoke', async ({
    getPageModel,
    page,
    uniqueId
  }) => {
    await startSession(getPageModel, `Remote${uniqueId}`, `Subject${uniqueId}`, 'Male');

    await page.getByTestId('nav-button-/session/remote-assignment').click();
    await page.waitForURL('**/session/remote-assignment');

    const remoteAssignmentPage = new RemoteAssignmentPage(page);
    await expect(remoteAssignmentPage.pageHeader).toContainText('Remote Assignment');
    await expect(remoteAssignmentPage.instrumentShowcase).toBeVisible();
  });

  test('should create a remote assignment and display the link', async ({ getPageModel, page, uniqueId }) => {
    await startSession(getPageModel, `Assign${uniqueId}`, `User${uniqueId}`, 'Female');

    await page.getByTestId('nav-button-/session/remote-assignment').click();
    await page.waitForURL('**/session/remote-assignment');

    const remoteAssignmentPage = new RemoteAssignmentPage(page);
    await expect(remoteAssignmentPage.instrumentShowcase).toBeVisible();
    await remoteAssignmentPage.clickFirstInstrumentCard();

    const dialog = remoteAssignmentPage.createDialog;
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText('Create Remote Assignment');
    await remoteAssignmentPage.submitAssignmentForm();

    await expect(page.getByRole('link', { name: 'Assignment Link' })).toBeVisible();
    const urlInput = page.locator('input[readonly]');
    await expect(urlInput).toBeVisible();
    expect(await urlInput.inputValue()).toMatch(/^https?:\/\/.+/);
  });
});
