import type { Page } from '@playwright/test';

import { UserPage } from '../pages/_app/user.page';
import { SEEDED_USER_PASSWORD } from '../support/constants';
import { expect, test } from '../support/fixtures';

/**
 * Navigates in-app, for a session established through the real login form: the access token is held
 * in memory only, so a `page.goto` would drop it and land back on the login page.
 */
async function goToAccount(page: Page): Promise<void> {
  await page.getByTestId('user-dropup-trigger').click();
  await page.getByTestId('user-dropup-account').click();
  await expect(page).toHaveURL('/user');
}

async function logOut(page: Page): Promise<void> {
  await page.getByTestId('user-dropup-trigger').click();
  await page.getByTestId('user-dropup-logout').click();
  await expect(page).toHaveURL('/auth/login');
}

test.describe('user account', () => {
  test('should reach the account page from the sidebar dropup @smoke', async ({ getPageModel, page }) => {
    const dashboardPage = await getPageModel('/dashboard');

    await dashboardPage.sidebar.getByTestId('user-dropup-trigger').click();
    const accountItem = page.getByTestId('user-dropup-account');
    await expect(accountItem).toContainText('Account');
    await accountItem.click();

    const userPage = new UserPage(page);
    await expect(page).toHaveURL('/user');
    await expect(userPage.pageHeader).toContainText('Account');
  });

  test("should display the current user's own username and role", async ({ getPageModel }) => {
    const userPage = await getPageModel('/user');

    await expect(userPage.username).toBeVisible();
    await expect(userPage.role).toContainText('Group Manager');
  });

  test('should describe the password dialog, so it is announced with more than its title', async ({ getPageModel }) => {
    const userPage = await getPageModel('/user');

    await userPage.openPasswordDialog();

    await expect(userPage.passwordDialog).toHaveAccessibleDescription(/confirm it to save the change/);
  });

  test('should keep the dialog open when the new password is too weak', async ({ getPageModel }) => {
    const userPage = await getPageModel('/user');

    await userPage.openPasswordDialog();
    await userPage.submitNewPassword('password');

    await expect(userPage.passwordDialog.getByTestId('error-message-text')).toContainText(
      'Insufficient password strength'
    );
    await expect(userPage.passwordDialog).toBeVisible();
  });

  test('should keep the dialog open when the confirmation does not match', async ({ getPageModel }) => {
    const userPage = await getPageModel('/user');

    await userPage.openPasswordDialog();
    await userPage.submitNewPassword(`${SEEDED_USER_PASSWORD}_Changed`, `${SEEDED_USER_PASSWORD}_Mismatch`);

    await expect(userPage.passwordDialog.getByTestId('error-message-text')).toContainText('Passwords Must Match');
    await expect(userPage.passwordDialog).toBeVisible();
  });

  test('should change the password and let the user log in with the new one', async ({
    api,
    getPageModel,
    page,
    uniqueId
  }) => {
    const group = await api.createGroup();
    const { credentials } = await api.createUser({ groupIds: [group.id] });
    const newPassword = `Zq7#nGx${uniqueId}Rt9`;

    // A fresh, uniquely-named user logging in through the real form, rather than the shared
    // worker-cached identity: changing that password would invalidate the token every other spec in
    // the worker shares.
    const loginPage = await getPageModel('/auth/login');
    await loginPage.fillLoginForm(credentials);
    await loginPage.expect.toHaveURL('/dashboard');

    await goToAccount(page);

    const userPage = new UserPage(page);
    await userPage.openPasswordDialog();
    await userPage.submitNewPassword(newPassword);
    await expect(userPage.passwordDialog).toBeHidden();

    await logOut(page);

    await loginPage.fillLoginForm({ password: newPassword, username: credentials.username });
    await loginPage.expect.toHaveURL('/dashboard');
  });

  test('should clear contact details that are saved blank', async ({ api, authenticateAs, page, uniqueId }) => {
    const email = `contact-${uniqueId}@example.org`;
    const group = await api.createGroup();
    const { credentials } = await api.createUser({
      email,
      groupIds: [group.id],
      phoneNumber: '5145551234'
    });
    await authenticateAs(credentials);

    const userPage = new UserPage(page);
    await userPage.goto('/user');
    await expect(userPage.emailField).toHaveValue(email);
    await expect(userPage.phoneNumberField).toHaveValue('5145551234');

    await userPage.emailField.clear();
    await userPage.phoneNumberField.clear();
    await userPage.saveProfile();
    await expect(page.getByRole('heading', { name: 'Success' })).toBeVisible();

    await page.reload();
    await expect(userPage.emailField).toHaveValue('');
    await expect(userPage.phoneNumberField).toHaveValue('');
  });
});
