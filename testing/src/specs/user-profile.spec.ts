import type { Page } from '@playwright/test';

import { UserPage } from '../pages/_app/user.page';
import { acceptDisclaimerIfPresent } from '../support/disclaimer';
import { expect, test } from '../support/fixtures';

const STRONG_PASSWORD = 'Zq7#nGxLp3RtHm9Q';

/**
 * Opens the sidebar's user dropup and navigates to `/user` via its "Preferences" item -- the only
 * in-app path to the profile page.
 */
async function goToUserProfile(page: Page): Promise<void> {
  await acceptDisclaimerIfPresent(page);
  await page.getByTestId('user-dropup-trigger').click();
  await page.getByTestId('user-dropup-preferences').click();
  await expect(page).toHaveURL('/user');
}

async function logOut(page: Page): Promise<void> {
  await page.getByTestId('user-dropup-trigger').click();
  await page.getByTestId('user-dropup-logout').click();
  await expect(page).toHaveURL('/auth/login');
}

test.describe('user profile', () => {
  test("should display the current user's own name, username, and role", async ({ getPageModel }) => {
    const userPage = await getPageModel('/user');

    await expect(userPage.fullName).toBeVisible();
    await expect(userPage.username).toBeVisible();
    await expect(userPage.role).toHaveText('Group Manager');
  });

  test('should update a profile field and reflect the change without a reload', async ({
    api,
    getPageModel,
    page,
    uniqueId
  }) => {
    const group = await api.createGroup();
    const { credentials } = await api.createUser({
      firstName: `Explore${uniqueId}`,
      groupIds: [group.id],
      lastName: 'Profile'
    });

    // A fresh, uniquely-named user logs in through the real UI flow (rather than reusing the
    // shared, worker-cached GROUP_MANAGER identity via `getPageModel`) so this mutation cannot
    // affect any other test running in the same worker.
    const loginPage = await getPageModel('/auth/login');
    await loginPage.fillLoginForm(credentials);
    await loginPage.expect.toHaveURL('/dashboard');
    await goToUserProfile(page);

    const userPage = new UserPage(page);
    const email = `explore.${uniqueId}@example.com`;
    await userPage.emailField.fill(email);
    await userPage.submitButton.click();

    await expect(page.getByRole('heading', { name: 'Success' })).toBeVisible();
    await expect(userPage.emailField).toHaveValue(email);
  });

  test.describe('password validation', () => {
    test('should reject a password that does not meet the strength requirement', async ({ getPageModel }) => {
      const userPage = await getPageModel('/user');

      await userPage.changePassword('abc123');

      await expect(userPage.errorMessage).toHaveText('Insufficient password strength');
    });

    test('should reject a password change when the confirmation does not match', async ({ getPageModel }) => {
      const userPage = await getPageModel('/user');

      await userPage.changePassword(STRONG_PASSWORD, `${STRONG_PASSWORD}-mismatch`);

      await expect(userPage.errorMessage).toHaveText('Passwords Must Match');
    });
  });

  test('should change the password and let the user log in with the new one', async ({
    api,
    getPageModel,
    page,
    uniqueId
  }) => {
    const group = await api.createGroup();
    const { credentials } = await api.createUser({
      firstName: `Explore${uniqueId}`,
      groupIds: [group.id],
      lastName: 'Password'
    });
    const newPassword = `Zq7#nGx${uniqueId}Rt9`;

    const loginPage = await getPageModel('/auth/login');
    await loginPage.fillLoginForm(credentials);
    await loginPage.expect.toHaveURL('/dashboard');
    await goToUserProfile(page);

    const userPage = new UserPage(page);
    await userPage.changePassword(newPassword);
    await expect(page.getByRole('heading', { name: 'Success' })).toBeVisible();

    await logOut(page);

    await loginPage.fillLoginForm({ password: newPassword, username: credentials.username });
    await loginPage.expect.toHaveURL('/dashboard');
  });
});
