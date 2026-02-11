import { expect, test } from './helpers/fixtures';

test.describe('start session', () => {
  test('should display the start session form header', async ({ getPageModel }) => {
    const startSessionPage = await getPageModel('/session/start-session');
    await expect(startSessionPage.pageHeader).toBeVisible();
    await expect(startSessionPage.pageHeader).toContainText('Start Session');
    expect(startSessionPage.sessionForm).toBeDefined();
  });

  test('should fill subject identification input', async ({ getPageModel }) => {
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
    await expect(dobField).toHaveValue('01-01-1990');

    const sexField = startSessionPage.sessionForm.locator('[name="subjectSex"]');
    await expect(sexField).toHaveValue('MALE');
  });
});
