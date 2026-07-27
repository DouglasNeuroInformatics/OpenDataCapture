import { expect, test } from '../support/fixtures';

test.describe('admin branding', () => {
  test.use({ actingRole: 'ADMIN' });

  test('should link from the branding index to the login page editor', async ({ getPageModel }) => {
    const brandingPage = await getPageModel('/admin/branding');

    await expect(brandingPage.pageHeader).toContainText('Branding');
    await expect(brandingPage.loginPageLink).toBeVisible();

    await brandingPage.loginPageLink.click();
    await expect(brandingPage.$ref).toHaveURL('/admin/branding/login-page');
  });

  test('should save a login page branding change and keep it after leaving and returning', async ({
    getPageModel,
    uniqueId
  }) => {
    const instanceName = `E2E Instance ${uniqueId}`;

    const editorPage = await getPageModel('/admin/branding/login-page');
    await editorPage.instanceNameEnglishInput.fill(instanceName);
    await editorPage.saveButton.click();

    await expect(editorPage.$ref.getByText('The login page has been updated.')).toBeVisible();

    const reloadedPage = await getPageModel('/admin/branding/login-page');
    await expect(reloadedPage.instanceNameEnglishInput).toHaveValue(instanceName);
  });
});
