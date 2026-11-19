import { LoginPage } from '../pages/auth/login.page';
import { PHONE_VIEWPORT } from '../support/constants';
import { expect, test } from '../support/fixtures';

test.describe('admin branding', () => {
  test.use({ actingRole: 'ADMIN' });

  // The login page branding is one instance-wide document, so the test restores it at the end. The
  // name is set in French alone, so the login page has to fall back to it for an English reader.
  test('should save a login page branding change, keep it, and show it on a narrow login page', async ({
    getPageModel,
    page,
    uniqueId
  }) => {
    const frenchOnlyName = `Clinique ${uniqueId}`;

    const editorPage = await getPageModel('/admin/branding/login-page');
    await editorPage.enableBrandingCheckbox.check();
    await editorPage.instanceNameEnglishInput.fill('');
    await editorPage.instanceNameFrenchInput.fill(frenchOnlyName);
    await editorPage.saveAndConfirm();

    const reloadedPage = await getPageModel('/admin/branding/login-page');
    await expect(reloadedPage.instanceNameFrenchInput).toHaveValue(frenchOnlyName);

    await page.setViewportSize(PHONE_VIEWPORT);
    const loginPage = new LoginPage(page);
    await loginPage.goto('/auth/login');
    await loginPage.loginForm.waitFor();
    await loginPage.dismissDemoDialog();
    await expect(page.getByRole('heading', { level: 3, name: frenchOnlyName })).toBeVisible();

    const restoredEditorPage = await getPageModel('/admin/branding/login-page');
    await restoredEditorPage.enableBrandingCheckbox.uncheck();
    await restoredEditorPage.instanceNameFrenchInput.fill('');
    await restoredEditorPage.saveAndConfirm();
  });
});
