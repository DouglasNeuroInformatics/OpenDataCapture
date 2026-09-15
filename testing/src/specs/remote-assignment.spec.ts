import { RemoteAssignmentPage } from '../pages/_app/session/remote-assignment.page';
import { baseURL } from '../support/env';
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

  test('should offer a copy-to-clipboard control and a QR code alongside the assignment link', async ({
    context,
    getPageModel,
    page,
    uniqueId
  }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: baseURL });
    await startSession(getPageModel, `Copy${uniqueId}`, `User${uniqueId}`, 'Male');

    await page.getByTestId('nav-button-/session/remote-assignment').click();
    await page.waitForURL('**/session/remote-assignment');

    const remoteAssignmentPage = new RemoteAssignmentPage(page);
    await expect(remoteAssignmentPage.instrumentShowcase).toBeVisible();
    await remoteAssignmentPage.clickFirstInstrumentCard();
    await remoteAssignmentPage.submitAssignmentForm();

    await expect(remoteAssignmentPage.urlInput).toBeVisible();
    await expect(remoteAssignmentPage.qrCode).toBeVisible();

    const assignmentUrl = await remoteAssignmentPage.urlInput.inputValue();
    await remoteAssignmentPage.copyLinkButton.click();
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toBe(assignmentUrl);
  });

  test('should allow creating more than one remote assignment in the same session', async ({
    getPageModel,
    page,
    uniqueId
  }) => {
    await startSession(getPageModel, `Multi${uniqueId}`, `User${uniqueId}`, 'Female');

    await page.getByTestId('nav-button-/session/remote-assignment').click();
    await page.waitForURL('**/session/remote-assignment');

    const remoteAssignmentPage = new RemoteAssignmentPage(page);
    await expect(remoteAssignmentPage.instrumentShowcase).toBeVisible();
    await remoteAssignmentPage.selectInstrument('Happiness Questionnaire');
    await remoteAssignmentPage.submitAssignmentForm();
    const firstUrl = await remoteAssignmentPage.urlInput.inputValue();
    await remoteAssignmentPage.closeResultButton.click();

    await expect(remoteAssignmentPage.instrumentShowcase).toBeVisible();
    await remoteAssignmentPage.selectInstrument('General Consent Form');
    await remoteAssignmentPage.submitAssignmentForm();
    const secondUrl = await remoteAssignmentPage.urlInput.inputValue();

    expect(secondUrl).not.toBe(firstUrl);
  });

  // Entering by URL is the path a bookmarked link takes, and it runs the GATEWAY_ENABLED guard in
  // `beforeLoad` on a cold document load rather than on a client-side transition from the tab.
  // `getPageModel` asserts it landed on the URL it asked for, so a guard that wrongly bounced the
  // request to the table tab fails here.
  test('should allow deep-linking to the assignments tab while the gateway is deployed', async ({
    getPageModel,
    page,
    uniqueId
  }) => {
    await startSession(getPageModel, `Deep${uniqueId}`, `Subject${uniqueId}`, 'Male');

    await page.locator('[data-testid^="nav-button-/datahub/"]').click();
    await page.waitForURL('**/datahub/**/table');
    const subjectId = page.url().split('/datahub/')[1]!.split('/')[0]!;

    const assignmentsPage = await getPageModel('/datahub/$subjectId/assignments', { subjectId });
    await expect(assignmentsPage.assignmentRows).toHaveCount(0);
  });

  test("should let a group manager cancel an outstanding assignment from the subject's assignments tab", async ({
    getPageModel,
    page,
    uniqueId
  }) => {
    await startSession(getPageModel, `Cancel${uniqueId}`, `User${uniqueId}`, 'Male');

    await page.getByTestId('nav-button-/session/remote-assignment').click();
    await page.waitForURL('**/session/remote-assignment');

    const remoteAssignmentPage = new RemoteAssignmentPage(page);
    await expect(remoteAssignmentPage.instrumentShowcase).toBeVisible();
    await remoteAssignmentPage.selectInstrument('Happiness Questionnaire');
    await remoteAssignmentPage.submitAssignmentForm();
    await expect(remoteAssignmentPage.urlInput).toBeVisible();
    await remoteAssignmentPage.closeResultButton.click();

    await page.locator('[data-testid^="nav-button-/datahub/"]').click();
    await page.waitForURL('**/datahub/**/table');
    await page.getByRole('link', { name: 'Assignments' }).click();
    await page.waitForURL('**/datahub/**/assignments');

    await page.getByRole('row').filter({ hasText: 'Happiness Questionnaire' }).click();
    await page.getByRole('button', { name: 'Cancel' }).click();

    await expect(page.getByRole('row').filter({ hasText: 'Happiness Questionnaire' })).toContainText('Canceled');
  });
});
