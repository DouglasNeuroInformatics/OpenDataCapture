import { expect, test } from '../support/fixtures';

import type { StartSessionPage } from '../pages/_app/session/start-session.page';

/**
 * The definition is one instance-wide document, and it locks for good the first time any subject is
 * identified with it, so every scenario using it lives in this one serial file. Its first step keeps
 * the number of fields the same on every run, which is what a locked definition still accepts. Other
 * specs start sessions with the built-in methods in parallel, so only custom fields are ever turned
 * off here.
 */
const DEFINITION = {
  fields: [
    {
      label: { en: 'Animal ID' },
      pattern: '[A-Z]{2}[0-9]+',
      patternErrorMessage: { en: 'Two letters, then digits' }
    },
    { label: { en: 'Cage' }, pattern: '[0-9]+' }
  ],
  label: { en: 'Animal information' }
};

test.describe.configure({ mode: 'serial' });

test.describe('custom identifying fields', () => {
  let animalId: string;

  test.beforeAll(() => {
    animalId = `ab${Date.now()}`;
  });

  test('should define the fields and offer them', async ({ api }) => {
    const settings = await api.updateSubjectIdentificationSettings({
      customFields: DEFINITION,
      offeredMethods: ['CUSTOM_ID', 'PERSONAL_INFO', 'CUSTOM_FIELDS']
    });
    expect(settings.customFields).toMatchObject(DEFINITION);
  });

  test('should start a session for a subject identified by the fields, sending no name and no typed value', async ({
    getPageModel,
    page
  }) => {
    const startSessionPage = await getPageModel('/session/start-session');
    await startSessionPage.selectIdentificationMethod('CUSTOM_FIELDS');
    await startSessionPage.fillCustomFields(['a', '7']);
    await startSessionPage.submitForm();
    await expect(startSessionPage.subjectIdErrors).toHaveCount(0);
    await expect(startSessionPage.errorMessages).toHaveText(['Two letters, then digits']);

    await startSessionPage.fillCustomFields([animalId, '7']);
    await startSessionPage.fillSubjectDetails('Female');
    const sessionCreated = page.waitForRequest(
      (request) => request.url().endsWith('/v1/sessions') && request.method() === 'POST'
    );
    await startSessionPage.submitForm();
    const body = (await sessionCreated).postDataJSON() as { subjectData: { [key: string]: unknown } };
    expect(body.subjectData.id).toMatch(/^cf_[0-9a-f]{64}$/);
    expect(body.subjectData).not.toHaveProperty('firstName');
    expect(JSON.stringify(body)).not.toContain(animalId.slice(2));
    await expect(startSessionPage.successMessage).toBeVisible();
  });

  // Letter case and punctuation are normalized away before hashing, so they name the same subject.
  test('should recognize a returning subject from the same values typed differently, filling in and locking their details', async ({
    getPageModel
  }) => {
    const startSessionPage: StartSessionPage = await getPageModel('/session/start-session');
    await startSessionPage.selectIdentificationMethod('CUSTOM_FIELDS');
    await startSessionPage.fillCustomFields([`${animalId.slice(0, 2).toUpperCase()}-${animalId.slice(2)}`, ' 7 ']);
    await expect(startSessionPage.dateOfBirthField).toHaveValue('1990-01-01');
    await expect(startSessionPage.dateOfBirthField).toBeDisabled();
    await expect(startSessionPage.sexTrigger).toBeDisabled();
  });

  test('should find the subject from the data hub by the same fields', async ({ getPageModel, page }) => {
    await getPageModel('/datahub/subjects');
    await page.getByTestId('subject-lookup-search-button').click();
    const identificationForm = page.getByTestId('identification-form');
    await identificationForm.locator('[name="subjectIdentificationMethod"]').selectOption('CUSTOM_FIELDS');
    await identificationForm.locator('[name="customField0"]').fill(animalId);
    await identificationForm.locator('[name="customField1"]').fill('7');
    await identificationForm.getByRole('button', { name: 'Submit' }).click();
    await expect(page).toHaveURL(/\/datahub\/subjects\/cf_[0-9a-f]{64}\/table$/);
  });

  test.describe('on the settings page', () => {
    test.use({ actingRole: 'ADMIN' });

    test('should show the field list locked once a subject has been identified with it, with its labels still editable', async ({
      getPageModel,
      page
    }) => {
      const settingsPage = await getPageModel('/admin/settings');
      await settingsPage.openTab('subject-identification');
      await expect(page.getByTestId('custom-fields-lock-status')).toHaveAttribute('data-locked', 'true');
      await expect(page.getByTestId('custom-fields-add-field')).toHaveCount(0);
      await expect(page.getByTestId('custom-fields-remove')).toHaveCount(0);
      await expect(page.getByTestId('custom-field-0-label-en')).toBeEditable();
    });

    test('should warn how many subjects a built-in method identifies before turning it off', async ({
      getPageModel,
      page
    }) => {
      const settingsPage = await getPageModel('/admin/settings');
      await settingsPage.openTab('subject-identification');
      await page.getByTestId('offered-method-PERSONAL_INFO').click();
      await page.getByTestId('subject-identification-save').click();
      await expect(page.getByTestId('turn-off-count-PERSONAL_INFO')).toHaveText(/^Personal Information: \d+ subjects$/);
      // Confirming would stop every other spec from starting a session by personal information.
      await page.getByTestId('subject-identification-cancel-save').click();
    });

    test('should stop offering custom fields in Start Session once they are turned off, and offer them again', async ({
      getPageModel,
      page
    }) => {
      const settingsPage = await getPageModel('/admin/settings');
      await settingsPage.openTab('subject-identification');
      await page.getByTestId('offered-method-CUSTOM_FIELDS').click();
      await page.getByTestId('subject-identification-save').click();
      await expect(page.getByTestId('turn-off-count-CUSTOM_FIELDS')).toHaveText(
        /^Animal information: [1-9]\d* subjects$/
      );
      await page.getByTestId('subject-identification-confirm-save').click();
      await expect(page.getByTestId('subject-identification-confirm-dialog')).toBeHidden();

      const startSessionPage = await getPageModel('/session/start-session');
      await expect(startSessionPage.selectField.locator('option[value="CUSTOM_FIELDS"]')).toHaveCount(0);

      await settingsPage.goto('/admin/settings');
      await settingsPage.openTab('subject-identification');
      await page.getByTestId('offered-method-CUSTOM_FIELDS').click();
      const saved = page.waitForResponse((response) => {
        return response.url().endsWith('/v1/subjects/identification/settings') && response.request().method() === 'PUT';
      });
      await page.getByTestId('subject-identification-save').click();
      expect((await saved).ok()).toBe(true);
    });
  });
});
