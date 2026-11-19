import type { Locator, Page } from '@playwright/test';

import { expect, test } from '../support/fixtures';

function waitForLoginResponse(page: Page) {
  return page.waitForResponse(
    (response) => response.url().endsWith('/v1/auth/login') && response.request().method() === 'POST'
  );
}

test.describe('authentication', () => {
  test('should redirect unauthenticated users to the login page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL('/auth/login');
  });

  // A standard user's dashboard redirects to the start-session form, so pick a group manager, and
  // the last one, so a button wired to the first row's user would show the wrong username.
  test('should highlight only the demo rows that log in, and log in as the demo user whose row is chosen', async ({
    getPageModel,
    page
  }) => {
    const loginPage = await getPageModel('/auth/login');
    const backgroundColor = (row: Locator) => row.evaluate((element) => getComputedStyle(element).backgroundColor);
    const restingColor = await backgroundColor(loginPage.demoTableHeaderRow);

    await loginPage.demoTableHeaderRow.hover();
    expect(await backgroundColor(loginPage.demoTableHeaderRow)).toBe(restingColor);
    await loginPage.demoUserRows.first().hover();
    expect(await backgroundColor(loginPage.demoUserRows.first())).not.toBe(restingColor);

    const demoUserRow = loginPage.demoUserRows.filter({ hasText: 'Group Manager' }).last();
    const username = await demoUserRow.getByRole('cell').first().innerText();
    await demoUserRow.getByRole('button').click();

    await expect(loginPage.$ref).toHaveURL('/dashboard');
    await expect(page.getByTestId('user-dropup-trigger')).toHaveText(username);
  });

  // One account walks every refusal in turn. A notification from an earlier attempt can still be on
  // screen, so each attempt is read from its own response before the page is checked.
  test('should refuse a wrong password without revealing an archived account, and name the archive only to the right one', async ({
    api,
    getPageModel,
    page
  }) => {
    const group = await api.createGroup();
    const { credentials, user } = await api.createUser({ groupIds: [group.id] });
    const wrongPassword = { password: `wrong-${credentials.password}`, username: credentials.username };
    const archivedHeading = page.getByRole('heading', { name: 'Account Archived' });

    const loginPage = await getPageModel('/auth/login');
    const refused = waitForLoginResponse(page);
    await loginPage.fillLoginForm(wrongPassword);
    expect((await refused).status()).toBe(401);
    await expect(page.getByRole('heading', { name: 'Unauthorized' })).toBeVisible();
    await expect(page).toHaveURL('/auth/login');

    await api.archiveUser(user.id);
    const refusedWhileArchived = waitForLoginResponse(page);
    await loginPage.fillLoginForm(wrongPassword);
    const refusedWhileArchivedResponse = await refusedWhileArchived;
    expect(refusedWhileArchivedResponse.status()).toBe(401);
    expect(await refusedWhileArchivedResponse.text()).not.toContain('Archived');
    await expect(archivedHeading).toHaveCount(0);

    const archived = waitForLoginResponse(page);
    await loginPage.fillLoginForm(credentials);
    expect((await archived).status()).toBe(403);
    await expect(archivedHeading).toBeVisible();
    await expect(page).toHaveURL('/auth/login');
  });

  test('should log in through the UI, log out and require re-authentication for protected routes', async ({
    api,
    getPageModel,
    page
  }) => {
    // Logging in through the real UI form (rather than `getPageModel`, which injects the token via
    // `page.addInitScript`) matters here: an init script re-runs on every navigation, including the
    // hard reload `logout()` does, so it would silently re-authenticate the page and mask the very
    // thing this test checks.
    const group = await api.createGroup();
    const { credentials } = await api.createUser({ groupIds: [group.id] });

    const loginPage = await getPageModel('/auth/login');
    await loginPage.fillLoginForm(credentials);
    await expect(loginPage.$ref).toHaveURL('/dashboard');

    await page.getByTestId('user-dropup-trigger').click();
    await page.getByTestId('user-dropup-logout').click();
    await expect(page).toHaveURL('/auth/login');

    // Logout is a hard reload that drops the in-memory token, so a protected route redirects again.
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/auth/login');
  });
});
