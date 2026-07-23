import { expect, test } from '../support/fixtures';

test.describe('authentication', () => {
  test('should redirect unauthenticated users to the login page @smoke', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL('/auth/login');
  });

  test('should log in through the UI @smoke', async ({ api, getPageModel }) => {
    const group = await api.createGroup();
    const { credentials } = await api.createUser({ groupIds: [group.id] });

    const loginPage = await getPageModel('/auth/login');
    await loginPage.fillLoginForm(credentials);
    await loginPage.expect.toHaveURL('/dashboard');
  });
});
