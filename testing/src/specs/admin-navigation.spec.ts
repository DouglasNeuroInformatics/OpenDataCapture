import { expect, test } from '../support/fixtures';

test.describe('admin navigation', () => {
  test.use({ actingRole: 'ADMIN' });

  test('should keep the Admin Panel open on a page beneath one of its links', async ({ getPageModel }) => {
    const brandingPage = await getPageModel('/admin/branding');
    const adminPanel = brandingPage.sidebar.getByRole('button', { exact: true, name: 'Admin Panel' });
    await expect(adminPanel).toHaveAttribute('aria-expanded', 'true');

    await brandingPage.loginPageLink.click();
    await expect(brandingPage.$ref).toHaveURL('/admin/branding/login-page');
    await expect(adminPanel).toHaveAttribute('aria-expanded', 'true');
    await expect(brandingPage.sidebar.getByTestId('nav-button-/admin/branding')).toBeVisible();
  });
});
