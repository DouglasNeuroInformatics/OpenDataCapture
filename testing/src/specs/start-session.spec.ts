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

  test('should show a required-field error for every missing field when submitting the personal information form empty', async ({
    getPageModel
  }) => {
    const startSessionPage = await getPageModel('/session/start-session');
    await startSessionPage.sessionForm.waitFor({ state: 'visible' });
    await startSessionPage.selectIdentificationMethod('PERSONAL_INFO');
    await startSessionPage.submitForm();

    // First name, last name, sex and date of birth are all required for this method.
    await expect(startSessionPage.errorMessages).toHaveCount(4);
    for (const message of await startSessionPage.errorMessages.allTextContents()) {
      expect(message).toBe('This field is required');
    }
    await expect(startSessionPage.successMessage).not.toBeVisible();
  });

  test('should show a required-field error for a blank custom identifier', async ({ getPageModel }) => {
    const startSessionPage = await getPageModel('/session/start-session');
    await startSessionPage.sessionForm.waitFor({ state: 'visible' });
    await startSessionPage.selectIdentificationMethod('CUSTOM_ID');
    // Date of birth and sex are filled directly, leaving only the identifier blank.
    await startSessionPage.sessionForm.locator('[name="subjectDateOfBirth"]').fill('1990-01-01');
    await startSessionPage.sessionForm.locator('[name="subjectSex"]').selectOption('MALE');
    await startSessionPage.submitForm();

    await expect(startSessionPage.errorMessages).toHaveCount(1);
    await expect(startSessionPage.errorMessages).toHaveText('This field is required');
  });

  test('should reject a custom identifier containing an illegal character', async ({ getPageModel }) => {
    const startSessionPage = await getPageModel('/session/start-session');
    await startSessionPage.sessionForm.waitFor({ state: 'visible' });
    await startSessionPage.selectIdentificationMethod('CUSTOM_ID');
    await startSessionPage.subjectIdField.fill('subject$1');
    await startSessionPage.sessionForm.locator('[name="subjectDateOfBirth"]').fill('1990-01-01');
    await startSessionPage.sessionForm.locator('[name="subjectSex"]').selectOption('MALE');
    await startSessionPage.submitForm();

    await expect(startSessionPage.errorMessages.filter({ hasText: 'Illegal character: $' })).toBeVisible();
    await expect(startSessionPage.successMessage).not.toBeVisible();
  });

  test('should disable the Start Session nav link while a clinical session is active', async ({
    getPageModel,
    page,
    uniqueId
  }) => {
    const startSessionPage = await getPageModel('/session/start-session');
    await startSessionPage.sessionForm.waitFor({ state: 'visible' });
    await startSessionPage.selectIdentificationMethod('CUSTOM_ID');
    await startSessionPage.fillCustomIdentifier(`active-${uniqueId}`, 'Male');
    await startSessionPage.submitForm();
    await expect(startSessionPage.successMessage).toBeVisible();

    // There is no way to start a second session over an active one, so the link that would take you
    // back to the form is disabled outright rather than showing the form again. Check it from a
    // different route, since the nav items only re-derive their `disabled` state as an effect and a
    // navigation is what reliably observes the settled state.
    await page.getByTestId('nav-button-/dashboard').click();
    await page.waitForURL('**/dashboard');
    await expect(page.getByTestId('nav-button-/session/start-session')).toBeDisabled();
  });
});
