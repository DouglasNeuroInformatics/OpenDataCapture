import { expect, test } from '../support/fixtures';

const ADMIN_PANEL_GROUPS = {
  Access: ['/admin/groups', '/admin/users', '/admin/permission-sets'],
  Instance: ['/admin/settings', '/admin/branding', '/admin/mail'],
  Instruments: ['/admin/instrument-repos']
};

test.describe('admin navigation', () => {
  test.use({ actingRole: 'ADMIN' });

  test('should file every admin page under a group in the Admin Panel, leaving none at the top level', async ({
    getPageModel
  }) => {
    const dashboardPage = await getPageModel('/dashboard');
    await expect(dashboardPage.sidebar.getByRole('button', { exact: true, name: 'Admin Panel' })).toBeVisible();
    await expect(dashboardPage.sidebar.locator('[data-nav-url^="/admin/"]')).toHaveCount(0);

    await dashboardPage.expandNavGroup('Admin Panel');
    for (const [group, urls] of Object.entries(ADMIN_PANEL_GROUPS)) {
      await dashboardPage.expandNavGroup(group);
      for (const url of urls) {
        await expect(dashboardPage.sidebar.getByTestId(`nav-button-${url}`)).toBeVisible();
      }
    }
  });

  test('should reach the audit logs straight from the Admin Panel, without opening a group', async ({
    getPageModel
  }) => {
    const dashboardPage = await getPageModel('/dashboard');
    await dashboardPage.expandNavGroup('Admin Panel');
    await dashboardPage.sidebar.getByTestId('nav-button-/admin/audit/logs').click();
    await expect(dashboardPage.$ref).toHaveURL('/admin/audit/logs');
  });

  test('should reach the users list through Access in the Admin Panel', async ({ getPageModel }) => {
    const dashboardPage = await getPageModel('/dashboard');
    await dashboardPage.expandNavGroup('Admin Panel');
    await dashboardPage.expandNavGroup('Access');
    await dashboardPage.sidebar.getByTestId('nav-button-/admin/users').click();
    await expect(dashboardPage.$ref).toHaveURL('/admin/users');
    await expect(dashboardPage.$ref.getByTestId('page-header')).toContainText('Manage Users');
  });

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
