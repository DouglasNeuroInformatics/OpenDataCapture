import { users } from './helpers/data';
import { expect, test } from './helpers/fixtures';

test.describe('redirects', () => {
  test('should redirect to login page from the index page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL('/auth/login');
  });
});

test.describe('login page', () => {
  test('should allow logging in', async ({ getPageModel, getProjectMetadata }) => {
    const loginPage = await getPageModel('/auth/login');
    const credentials = users[getProjectMetadata('browserTarget')];
    await loginPage.fillLoginForm(credentials);
    await loginPage.expect.toHaveURL('/dashboard');
  });
});
