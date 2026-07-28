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

  test.describe('invalid credentials', () => {
    test('should show an error and stay on the login page for a wrong password', async ({
      api,
      getPageModel,
      page
    }) => {
      const group = await api.createGroup();
      const { credentials } = await api.createUser({ groupIds: [group.id] });

      const loginPage = await getPageModel('/auth/login');
      await loginPage.fillLoginForm({ password: `wrong-${credentials.password}`, username: credentials.username });

      await expect(page.getByRole('heading', { name: 'Unauthorized' })).toBeVisible();
      await expect(page).toHaveURL('/auth/login');
    });

    test('should show an error and stay on the login page for an unknown username', async ({
      getPageModel,
      page,
      uniqueId
    }) => {
      const loginPage = await getPageModel('/auth/login');
      await loginPage.fillLoginForm({ password: `NoSuchAccount${uniqueId}!`, username: `no-such-user-${uniqueId}` });

      await expect(page.getByRole('heading', { name: 'Unauthorized' })).toBeVisible();
      await expect(page).toHaveURL('/auth/login');
    });
  });

  test('should log out and require re-authentication for protected routes', async ({ api, getPageModel, page }) => {
    // Logging in through the real UI form (rather than `getPageModel`, which injects the token via
    // `page.addInitScript`) matters here: an init script re-runs on every navigation, including the
    // hard reload `logout()` does, so it would silently re-authenticate the page and mask the very
    // thing this test checks.
    const group = await api.createGroup();
    const { credentials } = await api.createUser({ groupIds: [group.id] });

    const loginPage = await getPageModel('/auth/login');
    await loginPage.fillLoginForm(credentials);
    await loginPage.expect.toHaveURL('/dashboard');

    await page.getByTestId('user-dropup-trigger').click();
    await page.getByTestId('user-dropup-logout').click();
    await expect(page).toHaveURL('/auth/login');

    // Logout is a hard reload that drops the in-memory token, so a protected route redirects again.
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/auth/login');
  });
});
