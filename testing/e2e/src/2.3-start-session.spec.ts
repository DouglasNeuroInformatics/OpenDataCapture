import { expect, test } from './helpers/fixtures';

test.describe('start session', () => {
  test('should display the start session form header', async ({ getPageModel }) => {
    const startSessionPage = await getPageModel('/session/start-session');
    await expect(startSessionPage.pageHeader).toBeVisible();
    await expect(startSessionPage.pageHeader).toContainText('Start Session');
    expect(startSessionPage.sessionForm).toBeDefined();
  });

  test('should fill subject personal information input', async ({ getPageModel, page }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        'app',
        JSON.stringify({ state: { isDisclaimerAccepted: true, isWalkthroughComplete: true }, version: 1 })
      );
    });

    const startSessionPage = await getPageModel('/session/start-session');

    await startSessionPage.sessionForm.waitFor({ state: 'visible' });
    await startSessionPage.selectIdentificationMethod('PERSONAL_INFO');

    // Verify the selection was made
    await expect(startSessionPage.selectField).toHaveValue('PERSONAL_INFO');

    // Fill the subject first name field
    await startSessionPage.fillSessionForm('firstNameTest', 'lastNameTest', 'Male');

    // Verify the field was filled
    const firstNameField = startSessionPage.sessionForm.locator('[name="subjectFirstName"]');
    await expect(firstNameField).toHaveValue('firstNameTest');

    const lastNameField = startSessionPage.sessionForm.locator('[name="subjectLastName"]');
    await expect(lastNameField).toHaveValue('lastNameTest');

    const dobField = startSessionPage.sessionForm.locator('[name="subjectDateOfBirth"]');
    await expect(dobField).toHaveValue('1990-01-01');

    const sexField = startSessionPage.sessionForm.locator('[name="subjectSex"]');
    await expect(sexField).toHaveValue('MALE');

    const sessionTypeSelector = startSessionPage.sessionForm.locator('[name="sessionType"]');
    await expect(sessionTypeSelector).toHaveValue('RETROSPECTIVE');

    const sessionDate = startSessionPage.sessionForm.locator('[name="sessionDate"]');
    await expect(sessionDate).toHaveValue('2026-01-01');

    await startSessionPage.submitForm();

    await expect(startSessionPage.successMessage).toBeVisible();
  });
});

test.describe('start session', () => {
  test('should fill custom identifier input', async ({ getPageModel, page }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        'app',
        JSON.stringify({ state: { isDisclaimerAccepted: true, isWalkthroughComplete: true }, version: 1 })
      );
    });

    const startSessionPage = await getPageModel('/session/start-session');

    await startSessionPage.sessionForm.waitFor({ state: 'visible' });
    await startSessionPage.selectIdentificationMethod('CUSTOM_ID');

    // Verify the selection was made
    await expect(startSessionPage.selectField).toHaveValue('CUSTOM_ID');

    // Fill the subject first name field
    await startSessionPage.fillCustomIdentifier('customIdentifierTest', 'Male');

    // Verify the field was filled
    const subjectIdField = startSessionPage.sessionForm.locator('[name="subjectId"]');
    await expect(subjectIdField).toHaveValue('customIdentifierTest');

    const sessionTypeSelector = startSessionPage.sessionForm.locator('[name="sessionType"]');
    await expect(sessionTypeSelector).toHaveValue('RETROSPECTIVE');

    const sessionDate = startSessionPage.sessionForm.locator('[name="sessionDate"]');
    await expect(sessionDate).toHaveValue('2026-01-01');

    await startSessionPage.submitForm();

    await expect(startSessionPage.successMessage).toBeVisible();
  });
});
