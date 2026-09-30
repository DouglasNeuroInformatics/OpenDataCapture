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

  test.describe('demo instance', () => {
    test('should show the demo information over the login page as soon as it loads', async ({ getPageModel }) => {
      const loginPage = await getPageModel('/auth/login');
      await expect(loginPage.demoDialog).toBeVisible();
    });

    test('should brand the demo information with the Open Data Capture logo and name', async ({ getPageModel }) => {
      const loginPage = await getPageModel('/auth/login');
      await expect(loginPage.demoDialogBranding.locator('svg')).toBeVisible();
      await expect(loginPage.demoDialogBranding).toHaveText('Open Data Capture');
    });

    test('should reveal the login form once the demo information is dismissed', async ({ getPageModel }) => {
      const loginPage = await getPageModel('/auth/login');
      await expect(loginPage.demoDialog).toBeVisible();
      await loginPage.dismissDemoDialog();

      const usernameField = loginPage.loginForm.getByLabel('username');
      await usernameField.click();
      await expect(usernameField).toBeFocused();
    });

    // A standard user's dashboard redirects to the start-session form, so pick a group manager, and
    // the last one, so a button wired to the first row's user would show the wrong username.
    test('should log in as the demo user whose row is chosen in the demo information', async ({
      getPageModel,
      page
    }) => {
      const loginPage = await getPageModel('/auth/login');
      const demoUserRow = loginPage.demoUserRows.filter({ hasText: 'Group Manager' }).last();
      const username = await demoUserRow.getByRole('cell').first().innerText();
      await demoUserRow.getByRole('button').click();

      await loginPage.expect.toHaveURL('/dashboard');
      await expect(page.getByTestId('user-dropup-trigger')).toHaveText(username);
    });

    test('should log in from a click on the row itself, not only on its button', async ({ getPageModel, page }) => {
      const loginPage = await getPageModel('/auth/login');
      const demoUserRow = loginPage.demoUserRows.filter({ hasText: 'Group Manager' }).last();
      const usernameCell = demoUserRow.getByRole('cell').first();
      const username = await usernameCell.innerText();
      await usernameCell.click();

      await loginPage.expect.toHaveURL('/dashboard');
      await expect(page.getByTestId('user-dropup-trigger')).toHaveText(username);
    });

    test('should highlight only the rows that log in, so the header does not look clickable', async ({
      getPageModel
    }) => {
      const loginPage = await getPageModel('/auth/login');
      const headerRow = loginPage.demoUserTableHeaderRow;
      const restingColor = await headerRow.evaluate((element) => getComputedStyle(element).backgroundColor);

      expect(await loginPage.backgroundColorWhileHovering(headerRow)).toBe(restingColor);
      expect(await loginPage.backgroundColorWhileHovering(loginPage.demoUserRows.first())).not.toBe(restingColor);
    });
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
