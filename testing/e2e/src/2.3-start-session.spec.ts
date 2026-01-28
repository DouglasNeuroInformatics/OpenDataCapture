import { expect, test } from './helpers/fixtures';

test.describe('start session', () => {
  test.beforeAll(async ({ page }) => {
    // Set disclaimer as accepted for persistence across tests
    await page.addInitScript(() => {
      localStorage.setItem('app', JSON.stringify({ state: { isDisclaimerAccepted: true }, version: 1 }));
    });
  });

  test('should display the start session form header', async ({ getPageModel }) => {
    const startSessionPage = await getPageModel('/session/start-session');
    await expect(startSessionPage.pageHeader).toBeVisible();
    await expect(startSessionPage.pageHeader).toContainText('Start Session');
    expect(startSessionPage.sessionForm).toBeDefined();
  });

  test('should fill subject identification input', async ({ getPageModel }) => {
    const startSessionPage = await getPageModel('/session/start-session');

    await startSessionPage.sessionForm.waitFor({ state: 'visible' });
    const formType = startSessionPage.sessionForm.getByTestId('subjectIdentificationMethod-select-trigger');
    await formType.click();

    await startSessionPage.selectIdentificationMethod('PERSONAL_INFO');

    // await startSessionPage.selectIdentificationMethod('Personal Information')
    await expect(formType).toHaveText('Personal Information');

    // const identifier = startSessionPage.sessionForm.locator('#subjectFirstName');
    // await identifier.fill('john')
    // await expect(identifier).toHaveText('john');
    // await startSessionPage.fillSessionForm('john')

    // await startSessionPage.sessionForm.fill('John');
    // await expect(startSessionPage.sessionForm).toHaveValue('John');
  });
});
