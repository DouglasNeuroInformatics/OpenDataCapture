import { expect, test } from '../support/fixtures';

test.describe('start session', () => {
  test('should display the start session form @smoke', async ({ getPageModel }) => {
    const startSessionPage = await getPageModel('/session/start-session');
    await expect(startSessionPage.pageHeader).toBeVisible();
    await expect(startSessionPage.pageHeader).toContainText('Start Session');
    await expect(startSessionPage.sessionForm).toBeVisible();
  });

  test('should start a session using personal information', async ({ getPageModel, uniqueId }) => {
    const startSessionPage = await getPageModel('/session/start-session');
    await startSessionPage.sessionForm.waitFor({ state: 'visible' });

    await startSessionPage.selectIdentificationMethod('PERSONAL_INFO');
    await startSessionPage.fillSessionForm(`First${uniqueId}`, `Last${uniqueId}`, 'Male');
    await startSessionPage.submitForm();

    await expect(startSessionPage.successMessage).toBeVisible();
  });

  test('should start a session using a custom identifier', async ({ getPageModel, uniqueId }) => {
    const startSessionPage = await getPageModel('/session/start-session');
    await startSessionPage.sessionForm.waitFor({ state: 'visible' });

    await startSessionPage.selectIdentificationMethod('CUSTOM_ID');
    await startSessionPage.fillCustomIdentifier(`custom-${uniqueId}`, 'Male');
    await startSessionPage.submitForm();

    await expect(startSessionPage.successMessage).toBeVisible();
  });
});
