import { UserPage } from '../pages/_app/user.page';
import { ApiClient } from '../support/api-client';
import { expect, test } from '../support/fixtures';

test.describe('user account', () => {
  test("should reach the account page from the sidebar dropup and show the user's own username and role", async ({
    getPageModel,
    page
  }) => {
    const dashboardPage = await getPageModel('/dashboard');

    await dashboardPage.sidebar.getByTestId('user-dropup-trigger').click();
    const accountItem = page.getByTestId('user-dropup-account');
    await expect(accountItem).toContainText('Account');
    await accountItem.click();

    const userPage = new UserPage(page);
    await expect(page).toHaveURL('/user');
    await expect(userPage.pageHeader).toContainText('Account');
    await expect(userPage.username).toBeVisible();
    await expect(userPage.role).toContainText('Group Manager');
  });

  // A fresh, uniquely-named user rather than the shared worker-cached identity: changing that password
  // would invalidate the token every other spec in the worker shares.
  test('should change the password, so the user signs in with the new one and not the old', async ({
    api,
    apiRequestContext,
    authenticateAs,
    page,
    uniqueId
  }) => {
    const group = await api.createGroup();
    const { credentials } = await api.createUser({ groupIds: [group.id] });
    const newPassword = `Zq7#nGx${uniqueId}Rt9`;
    await authenticateAs(credentials);

    const userPage = new UserPage(page);
    await userPage.goto('/user');
    await userPage.openPasswordDialog();
    await userPage.submitNewPassword(newPassword);
    await expect(userPage.passwordDialog).toBeHidden();

    // The API stops renewing a token issued under the old password, so the app asks for the new one
    // at once rather than a minute later.
    await expect(userPage.reauthenticationDialog).toBeVisible();
    await userPage.signInAgain(newPassword);

    await ApiClient.login(apiRequestContext, { password: newPassword, username: credentials.username });
    const oldPasswordLogin = await apiRequestContext.post('/api/v1/auth/login', { data: credentials });
    expect(oldPasswordLogin.status()).toBe(401);
  });

  test('should save contact details cleared to blank and an international phone number', async ({
    api,
    authenticateAs,
    page,
    uniqueId
  }) => {
    const email = `contact-${uniqueId}@example.org`;
    const group = await api.createGroup();
    const { credentials } = await api.createUser({
      email,
      groupIds: [group.id],
      phoneNumber: '5145551234'
    });
    await authenticateAs(credentials);
    const savedNotice = page.getByRole('heading', { name: 'Success' });

    const userPage = new UserPage(page);
    await userPage.goto('/user');
    await expect(userPage.emailField).toHaveValue(email);
    await expect(userPage.phoneNumberField).toHaveValue('5145551234');

    await userPage.emailField.clear();
    await userPage.phoneNumberField.clear();
    await userPage.saveProfile();
    await expect(savedNotice).toBeVisible();

    await page.reload();
    await expect(userPage.emailField).toHaveValue('');
    await expect(userPage.phoneNumberField).toHaveValue('');

    await userPage.phoneNumberField.fill('+1 514 555 1234');
    await userPage.saveProfile();
    await expect(savedNotice).toBeVisible();

    await page.reload();
    await expect(userPage.phoneNumberField).toHaveValue('+1 514 555 1234');
  });
});
