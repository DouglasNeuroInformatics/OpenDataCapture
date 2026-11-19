import { GroupEmailTemplatesPage } from '../pages/_app/group/email-templates.page';
import { expect, test } from '../support/fixtures';

test.describe('group email templates', () => {
  // A group of its own, since making a template the default changes what every member's participants
  // receive. Adding a template must not silently change that; only setting it as default does, and
  // deleting the default returns to the built-in message rather than promoting an arbitrary row.
  test('should make a new template the default only when asked, and fall back to the built-in one when it is deleted', async ({
    isolatedGroupManager,
    page,
    uniqueId
  }) => {
    await isolatedGroupManager();
    const templatesPage = new GroupEmailTemplatesPage(page);
    await templatesPage.goto('/group/email-templates');
    await expect(templatesPage.builtInDefaultBadge).toBeVisible();

    const name = `Template${uniqueId}`;
    await templatesPage.name.fill(name);
    await templatesPage.createSubject.fill(`Subject${uniqueId}`);
    await templatesPage.createBody.fill('It expires on {{expiresAt}}. Complete your assignment: ');
    await templatesPage.insertUrl.click();
    await expect(templatesPage.createBody).toHaveValue(/\{\{url\}\}/);
    await templatesPage.createSubmit.click();
    // Authored in one language, so the missing-translations warning has to be confirmed.
    await templatesPage.createAnyway.click();
    await expect(templatesPage.rowFor(name)).toBeVisible();
    await expect(templatesPage.builtInDefaultBadge).toBeVisible();

    await templatesPage.setActiveButtonFor(name).click();
    await expect(templatesPage.builtInDefaultBadge).toBeHidden();

    // Nothing is destroyed until the dialog is confirmed.
    await templatesPage.deleteButtonFor(name).click();
    await expect(templatesPage.deleteConfirm).toBeVisible();
    await expect(templatesPage.rowFor(name)).toBeVisible();
    await templatesPage.deleteConfirm.click();
    await expect(templatesPage.rowFor(name)).toBeHidden();
    await expect(templatesPage.builtInDefaultBadge).toBeVisible();
  });
});
