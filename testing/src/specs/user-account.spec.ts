import { UserAccountPage } from '../pages/_app/user.page';
import { SEEDED_USER_PASSWORD } from '../support/constants';
import { expect, test } from '../support/fixtures';

test.describe('user account', () => {
  test('should reach the account page from the sidebar dropup @smoke', async ({ getPageModel, page }) => {
    const dashboardPage = await getPageModel('/dashboard');

    await dashboardPage.sidebar.getByTestId('user-dropup-trigger').click();
    const accountItem = page.getByTestId('user-dropup-account');
    await expect(accountItem).toContainText('Account');
    await accountItem.click();

    const userAccountPage = new UserAccountPage(page);
    await expect(page).toHaveURL('/user');
    await expect(userAccountPage.pageHeader).toContainText('Account');
  });

  test('should keep the dialog open when the new password is too weak', async ({ getPageModel }) => {
    const userAccountPage = await getPageModel('/user');

    await userAccountPage.openPasswordDialog();
    await userAccountPage.submitNewPassword('password');

    await expect(userAccountPage.passwordDialog.getByTestId('error-message-text')).toContainText(
      'Insufficient password strength'
    );
    await expect(userAccountPage.passwordDialog).toBeVisible();
  });

  test('should close the dialog after the password is changed', async ({ api, authenticateAs, page }) => {
    const group = await api.createGroup();
    const { credentials } = await api.createUser({ groupIds: [group.id] });
    await authenticateAs(credentials);

    const userAccountPage = new UserAccountPage(page);
    await userAccountPage.goto('/user');
    await userAccountPage.openPasswordDialog();
    await userAccountPage.submitNewPassword(`${SEEDED_USER_PASSWORD}_Changed`);

    await expect(userAccountPage.passwordDialog).toBeHidden();
  });

  test('should clear contact details that are saved blank', async ({ api, authenticateAs, page }) => {
    const group = await api.createGroup();
    const { credentials } = await api.createUser({
      email: 'contact@example.org',
      groupIds: [group.id],
      phoneNumber: '5145551234'
    });
    await authenticateAs(credentials);

    const userAccountPage = new UserAccountPage(page);
    await userAccountPage.goto('/user');
    await expect(userAccountPage.emailInput).toHaveValue('contact@example.org');
    await expect(userAccountPage.phoneNumberInput).toHaveValue('5145551234');

    await userAccountPage.emailInput.clear();
    await userAccountPage.phoneNumberInput.clear();
    await userAccountPage.saveProfile();
    await expect(page.getByRole('heading', { name: 'Success' })).toBeVisible();

    await page.reload();
    await expect(userAccountPage.emailInput).toHaveValue('');
    await expect(userAccountPage.phoneNumberInput).toHaveValue('');
  });
});
