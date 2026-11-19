import { ResetPasswordPage } from '../pages/auth/reset-password.page';
import { expect, test } from '../support/fixtures';

/** Strong, not breached, and not the username -- so only the policy under test can reject it. */
const chosenPassword = (uniqueId: string) => `chosen-oyster-lantern-${uniqueId}`;

test.describe('a user whose password was generated', () => {
  // Signs in through the real form throughout: `authenticateAs` would re-inject the original token on
  // the reload `logout()` performs, silently re-authenticating the page and hiding the sign-out.
  test('should be sent to the reset page on sign-in, refused the issued password, and regain the app with a new one', async ({
    api,
    getPageModel,
    page,
    uniqueId
  }) => {
    const group = await api.createGroup();
    const { credentials } = await api.createUser({ groupIds: [group.id], mustResetPassword: true });
    const newPassword = chosenPassword(uniqueId);

    const loginPage = await getPageModel('/auth/login');
    await loginPage.fillLoginForm(credentials);
    await expect(page).toHaveURL('/auth/reset-password');

    const resetPage = new ResetPasswordPage(page);
    await resetPage.fillResetForm(credentials.password);
    await expect(page.getByText('Password must not be the same as your current password')).toBeVisible();
    await expect(page).toHaveURL('/auth/reset-password');

    await resetPage.fillResetForm(newPassword);
    await expect(resetPage.successMessage).toBeVisible();
    await resetPage.signInButton.click();

    await expect(page).toHaveURL('/auth/login');
    await loginPage.fillLoginForm({ password: newPassword, username: credentials.username });

    // The flag is cleared, so the token this sign-in mints no longer locks them out. Moving on from
    // the landing page is done through the sidebar rather than `page.goto`, because a hard
    // navigation would discard the in-memory token and send them back to login for an unrelated
    // reason.
    await expect(page).toHaveURL('/dashboard');
    await page.getByTestId('nav-button-/session/start-session').click();
    await expect(page).toHaveURL('/session/start-session');
  });
});
