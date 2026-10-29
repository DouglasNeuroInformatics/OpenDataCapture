import { LoginPage } from '../pages/auth/login.page';
import { PHONE_VIEWPORT } from '../support/constants';
import { expect, test } from '../support/fixtures';

// The login page branding is one instance-wide document and every save sends all of its fields, so
// two tests saving it concurrently would overwrite each other's values.
test.describe.configure({ mode: 'serial' });

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

test.describe('login page instance name', () => {
  test.use({ actingRole: 'ADMIN', viewport: PHONE_VIEWPORT });

  test('should show an instance name set only in French to an English reader on a narrow screen', async ({
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

test.describe('login image custom size', () => {
  test.use({ actingRole: 'ADMIN' });

  test('should allow saving after hiding a login image that has an incomplete custom size', async ({
    getPageModel
  }) => {
    const editorPage = await getPageModel('/admin/branding/login-page');
    await editorPage.showLogoCheckbox.check();
    await editorPage.selectLogoSize('Custom');
    await editorPage.customLogoWidthInput.fill('');
    await editorPage.customLogoHeightInput.fill('');
    await expect(editorPage.saveButton).toBeDisabled();

    await editorPage.showLogoCheckbox.uncheck();
    await expect(editorPage.saveButton).toBeEnabled();
  });
});
