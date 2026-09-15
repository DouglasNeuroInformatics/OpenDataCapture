import { ResetPasswordPage } from '../pages/auth/reset-password.page';
import { ApiClient } from '../support/api-client';
import { expect, test } from '../support/fixtures';

/** Strong, not breached, and not the username -- so only the policy under test can reject it. */
const chosenPassword = (uniqueId: string) => `chosen-oyster-lantern-${uniqueId}`;

test.describe('generating a password', () => {
  test.use({ actingRole: 'ADMIN' });

  test('should fill both password fields, so the admin never transcribes a passphrase', async ({
    authenticateAs,
    page
  }) => {
    await authenticateAs('ADMIN');
    await page.goto('/admin/users/create');

    const passwordField = page.getByLabel('Password', { exact: true });
    await page.getByRole('button', { name: 'Generate Passphrase' }).click();

    const generated = await passwordField.inputValue();
    expect(generated.split('-')).toHaveLength(5);

    // The field reveals what it generated, since a password nobody can read cannot be relayed.
    await expect(passwordField).toHaveAttribute('type', 'text');
    // `setValue` fills only `password`; the confirmation is mirrored through the form's `subscribe`.
    await expect(page.getByLabel('Confirm Password')).toHaveValue(generated);
  });

  test('should keep whatever else the admin already typed', async ({ authenticateAs, page, uniqueId }) => {
    await authenticateAs('ADMIN');
    await page.goto('/admin/users/create');

    const username = `user${uniqueId}`;
    await page.getByLabel('Username').fill(username);
    await page.getByRole('button', { name: 'Generate Passphrase' }).click();

    await expect(page.getByLabel('Password', { exact: true })).not.toHaveValue('');
    await expect(page.getByLabel('Username')).toHaveValue(username);
  });
});

test.describe('a user whose password was generated', () => {
  test('should be sent to the reset page when they sign in @smoke', async ({ api, getPageModel, page }) => {
    const group = await api.createGroup();
    const { credentials } = await api.createUser({ groupIds: [group.id], mustResetPassword: true });

    const loginPage = await getPageModel('/auth/login');
    await loginPage.fillLoginForm(credentials);

    await expect(page).toHaveURL('/auth/reset-password');
  });

  // `authenticateAs` rather than the login form: it injects the token through `page.addInitScript`,
  // which re-runs on each hard navigation. Signing in through the form leaves the token in memory
  // only, so `page.goto` would drop it and every route would redirect to login for the wrong reason.
  test('should be kept there wherever they try to navigate', async ({ api, authenticateAs, page }) => {
    const group = await api.createGroup();
    const { credentials } = await api.createUser({ groupIds: [group.id], mustResetPassword: true });
    await authenticateAs(credentials);

    // Every in-app route hangs off `_app`, so the one guard there covers all of them.
    for (const route of ['/dashboard', '/session/start-session', '/user']) {
      await page.goto(route);
      await expect(page).toHaveURL('/auth/reset-password');
    }
  });

  test('should be refused clinical data by the API, not only by the router', async ({ api, apiRequestContext }) => {
    const group = await api.createGroup();
    const { credentials, user } = await api.createUser({ groupIds: [group.id], mustResetPassword: true });
    const headers = { Authorization: `Bearer ${await ApiClient.login(apiRequestContext, credentials)}` };

    // The token such a user is issued carries no permission but to read themselves, so a client that
    // simply ignores the redirect still reaches nothing.
    for (const path of ['/subjects', '/sessions', '/groups', '/assignments']) {
      const response = await apiRequestContext.get(`/api/v1${path}`, { headers });
      expect(response.status(), `GET ${path}`).toBe(403);
    }

    // `read User` is granted, because the reset itself is gated on it. `@RouteAccess` only checks the
    // subject type, so this route answers 200 -- what confines it is the rule's condition, applied by
    // `accessibleQuery`, which reduces the list to the one user asking.
    const users = await apiRequestContext.get('/api/v1/users', { headers });
    expect(users.status()).toBe(200);
    expect(await users.json()).toMatchObject([{ id: user.id }]);
  });

  test('should refuse the password it was issued, so the reset cannot be a no-op', async ({
    api,
    authenticateAs,
    page,
    uniqueId
  }) => {
    const group = await api.createGroup();
    const { credentials } = await api.createUser({ groupIds: [group.id], mustResetPassword: true });
    await authenticateAs(credentials);
    await page.goto('/auth/reset-password');

    const resetPage = new ResetPasswordPage(page);
    await resetPage.fillResetForm(credentials.password);

    await expect(page.getByText('Password must not be the same as your current password')).toBeVisible();
    await expect(page).toHaveURL('/auth/reset-password');

    // The same page still accepts a genuinely new password.
    await resetPage.fillResetForm(chosenPassword(uniqueId));
    await expect(resetPage.successMessage).toBeVisible();
  });

  // Signs in through the real form throughout: `authenticateAs` would re-inject the original token on
  // the reload `logout()` performs, silently re-authenticating the page and hiding the sign-out.
  test('should regain the app after choosing a password @smoke', async ({ api, getPageModel, page, uniqueId }) => {
    const group = await api.createGroup();
    const { credentials } = await api.createUser({ groupIds: [group.id], mustResetPassword: true });
    const newPassword = chosenPassword(uniqueId);

    const loginPage = await getPageModel('/auth/login');
    await loginPage.fillLoginForm(credentials);
    await expect(page).toHaveURL('/auth/reset-password');

    const resetPage = new ResetPasswordPage(page);
    await resetPage.fillResetForm(newPassword);
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
