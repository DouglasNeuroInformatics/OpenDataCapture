import { expect, test } from '../support/fixtures';

const BODY = 'Complete your assignment: {{url}} — it expires on {{expiresAt}}.';

test.describe('group email templates', () => {
  test('should start with the built-in template as the default', async ({ getPageModel }) => {
    const templatesPage = await getPageModel('/group/email-templates');

    await expect(templatesPage.root).toBeVisible();
    await expect(templatesPage.builtInDefaultBadge).toBeVisible();
  });

  // The link is the whole point of the email, so a template without it must not be creatable.
  test('should refuse a template whose body omits the required placeholders', async ({ getPageModel, uniqueId }) => {
    const templatesPage = await getPageModel('/group/email-templates');

    await templatesPage.name.fill(`Template${uniqueId}`);
    await templatesPage.createSubject.fill('Your assignment');
    await templatesPage.createBody.fill('No placeholders here.');

    await expect(templatesPage.createError).toBeVisible();
    await expect(templatesPage.createSubmit).toBeDisabled();
  });

  test('should insert a placeholder into the body from the toolbar', async ({ getPageModel }) => {
    const templatesPage = await getPageModel('/group/email-templates');

    await templatesPage.createBody.fill('Link:');
    await templatesPage.insertUrl.click();

    await expect(templatesPage.createBody).toHaveValue(/\{\{url\}\}/);
  });

  // A template authored in only one language is allowed, but not silently.
  test('should warn before creating a template that is missing a translation', async ({ getPageModel, uniqueId }) => {
    const templatesPage = await getPageModel('/group/email-templates');
    const name = `Template${uniqueId}`;

    await templatesPage.fillCreateForm({ body: BODY, name, subject: `Subject${uniqueId}` });

    await expect(templatesPage.createAnyway).toBeVisible();
    await expect(templatesPage.rowFor(name)).toBeHidden();
  });

  test('should create a template and make it the default', async ({ getPageModel, uniqueId }) => {
    const templatesPage = await getPageModel('/group/email-templates');
    const name = `Template${uniqueId}`;

    await templatesPage.createTemplate({ body: BODY, name, subject: `Subject${uniqueId}` });

    await expect(templatesPage.rowFor(name)).toBeVisible();
    // A custom template takes over as the default, displacing the built-in one.
    await expect(templatesPage.builtInDefaultBadge).toBeHidden();
  });

  test('should require confirmation before deleting a template', async ({ getPageModel, uniqueId }) => {
    const templatesPage = await getPageModel('/group/email-templates');
    const name = `Template${uniqueId}`;
    await templatesPage.createTemplate({ body: BODY, name, subject: `Subject${uniqueId}` });
    await expect(templatesPage.rowFor(name)).toBeVisible();

    await templatesPage.deleteButtonFor(name).click();

    // Nothing is destroyed until the dialog is confirmed.
    await expect(templatesPage.deleteConfirm).toBeVisible();
    await expect(templatesPage.rowFor(name)).toBeVisible();

    await templatesPage.deleteConfirm.click();
    await expect(templatesPage.rowFor(name)).toBeHidden();
  });
});
