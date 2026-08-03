import { RemoteAssignmentPage } from '../pages/_app/session/remote-assignment.page';
import { E2E_MAIL_CONFIG, SEEDED_USER_PASSWORD } from '../support/constants';
import { expect, test } from '../support/fixtures';

// Whether mail is on is a property of the instance, not of a test: it lives on `SetupState` and
// `isMailEnabled` gates UI across the whole app. Two spec files touching it would be scheduled into
// separate workers by `fullyParallel`, so one would flip the flag under the other — which is why
// every mail test lives in this one file, in serial mode. It also has to stay this way for the
// rest of the suite, which assumes mail is off; each block below states the flag it needs rather
// than inheriting whatever the previous one left behind.
test.describe.configure({ mode: 'serial' });

test.describe('mail settings', () => {
  test.use({ actingRole: 'ADMIN' });

  test.beforeAll(async ({ api }) => {
    await api.setMailEnabled(false);
  });

  // The save test below persists a different server, so the stored configuration is restored for
  // the delivery block and everything after it.
  test.afterAll(async ({ api }) => {
    await api.setMailEnabled(false);
  });

  test('should hide the server configuration until email is enabled', async ({ getPageModel }) => {
    const mailPage = await getPageModel('/admin/mail');

    await expect(mailPage.enableToggle).toBeVisible();
    await expect(mailPage.serverCard).toBeHidden();

    await mailPage.enableMail();
    await expect(mailPage.host).toBeVisible();
  });

  // Cleared explicitly rather than assuming an unconfigured instance: other specs in this suite
  // leave a stored configuration behind, and the assertion is about the required fields.
  test('should reject an incomplete configuration without saving it', async ({ getPageModel }) => {
    const mailPage = await getPageModel('/admin/mail');
    await mailPage.enableMail();
    await mailPage.host.fill('');
    await mailPage.username.fill('');

    await mailPage.saveConfig.click();

    await expect(mailPage.fieldError('host')).toBeVisible();
    await expect(mailPage.fieldError('username')).toBeVisible();

    // "Without saving it" is only proven by the round trip: the stored host must survive.
    await mailPage.$ref.reload();
    await mailPage.enableMail();
    await expect(mailPage.host).toHaveValue(E2E_MAIL_CONFIG.host);
  });

  // Pointing at a different server must not silently reuse the credential stored for the old one.
  test('should require the password again when the server changes', async ({ getPageModel }) => {
    const mailPage = await getPageModel('/admin/mail');
    await mailPage.enableMail();
    await mailPage.fillServerConfig({
      host: `smtp.somewhere-else.test`,
      password: '',
      port: '587',
      senderAddress: 'noreply@example.org',
      username: 'mailer'
    });

    await mailPage.saveConfig.click();

    await expect(mailPage.fieldError('password')).toBeVisible();
  });

  test('should reject a sender address that is not an email', async ({ getPageModel }) => {
    const mailPage = await getPageModel('/admin/mail');
    await mailPage.enableMail();
    await mailPage.fillServerConfig({
      host: 'smtp.example.org',
      password: 'hunter2',
      port: '587',
      senderAddress: 'not-an-email',
      username: 'mailer'
    });

    await mailPage.saveConfig.click();

    await expect(mailPage.fieldError('sender-address')).toBeVisible();
  });

  // The whole save path — validate, persist, re-seed from the response — while the secret
  // itself never round-trips back to the browser.
  test('should save a valid configuration without ever rendering the stored password', async ({ getPageModel }) => {
    const mailPage = await getPageModel('/admin/mail');
    await mailPage.enableMail();
    await mailPage.fillServerConfig({
      host: 'smtp.saved.test',
      password: 'hunter2',
      port: '2525',
      senderAddress: 'sender@example.org',
      username: 'saver'
    });

    await mailPage.saveConfig.click();
    await expect(mailPage.$ref.getByRole('heading', { name: 'Success' }).last()).toBeVisible();

    // The reload proves the save reached the database, not merely component state.
    await mailPage.$ref.reload();
    await mailPage.enableMail();
    await expect(mailPage.host).toHaveValue('smtp.saved.test');
    await expect(mailPage.username).toHaveValue('saver');
    await expect(mailPage.port).toHaveValue('2525');
    await expect(mailPage.password).toHaveAttribute('type', 'password');
    await expect(mailPage.password).not.toHaveValue('hunter2');
    await expect(mailPage.$ref.locator('body')).not.toContainText('hunter2');
  });

  test('should not offer to send a test email until the recipient is a valid address', async ({ getPageModel }) => {
    const mailPage = await getPageModel('/admin/mail');
    await mailPage.enableMail();

    await expect(mailPage.sendTest).toBeDisabled();
    await mailPage.testRecipient.fill('nonsense');
    await expect(mailPage.sendTest).toBeDisabled();
    await mailPage.testRecipient.fill('recipient@example.org');
    await expect(mailPage.sendTest).toBeEnabled();
  });

  test('should block saving a welcome template that drops the username placeholder', async ({ getPageModel }) => {
    const mailPage = await getPageModel('/admin/mail');
    await mailPage.enableMail();
    await mailPage.templateCard.scrollIntoViewIfNeeded();

    await mailPage.templateBody.fill('Welcome, but with no placeholders at all.');

    await expect(mailPage.templateSave).toBeDisabled();
  });
});

test.describe('mail delivery', () => {
  test.beforeAll(async ({ api }) => {
    await api.setMailEnabled(true);
  });

  test.afterAll(async ({ api }) => {
    await api.setMailEnabled(false);
  });

  test.describe('admin mail page', () => {
    test.use({ actingRole: 'ADMIN' });

    test('should show the saved configuration without ever returning the password', async ({ getPageModel }) => {
      const mailPage = await getPageModel('/admin/mail');

      await expect(mailPage.host).toHaveValue(E2E_MAIL_CONFIG.host);
      await expect(mailPage.username).toHaveValue(E2E_MAIL_CONFIG.username);
      // The stored password is real, so this is the assertion that it never reaches the browser.
      await expect(mailPage.password).not.toHaveValue(E2E_MAIL_CONFIG.password);
      await expect(mailPage.$ref.locator('body')).not.toContainText(E2E_MAIL_CONFIG.password);
    });

    test('should report a failed connection test in the reader’s language, not raw SMTP prose', async ({
      getPageModel
    }) => {
      const mailPage = await getPageModel('/admin/mail');

      await mailPage.testConnection.click();

      // `smtp.invalid.test` cannot resolve, so this exercises the whole failure path: nodemailer
      // error -> MailErrorCode -> localized copy. A raw driver message would leak "ENOTFOUND".
      const notification = mailPage.$ref.getByText(/could not be found|check and reconfigure/i);
      await expect(notification.first()).toBeVisible({ timeout: 40_000 });
      await expect(mailPage.$ref.locator('body')).not.toContainText('ENOTFOUND');
    });

    // Distinct from the connection test: this is the one path that calls `sendMail`, so the send
    // button has to be driven all the way to an outcome, not merely checked enabled.
    test('should report a failed test email in the reader’s language, not raw SMTP prose', async ({ getPageModel }) => {
      const mailPage = await getPageModel('/admin/mail');

      await mailPage.testRecipient.fill('recipient@example.org');
      await mailPage.sendTest.click();

      const notification = mailPage.$ref.getByText(/could not be found|check and reconfigure/i);
      await expect(notification.first()).toBeVisible({ timeout: 40_000 });
      await expect(mailPage.$ref.locator('body')).not.toContainText('ENOTFOUND');
    });
  });

  test.describe('welcome email', () => {
    // Delivery fails against the unroutable host, so the app must surface the rendered message
    // for manual sending rather than silently losing the one copy of it.
    test('should offer the rendered welcome message for manual delivery when sending fails', async ({
      authenticateAs,
      page,
      uniqueId
    }) => {
      const username = `welcome_${uniqueId}`;
      await authenticateAs('ADMIN');
      await page.goto('/admin/users/create');

      const createUserForm = page.getByTestId('create-user-form');
      await createUserForm.getByLabel('Username').fill(username);
      await createUserForm.getByLabel('Password', { exact: true }).fill(SEEDED_USER_PASSWORD);
      await createUserForm.getByLabel('Confirm Password').fill(SEEDED_USER_PASSWORD);
      await createUserForm.getByLabel('First Name').fill('Welcome');
      await createUserForm.getByLabel('Last Name').fill('Probe');
      await createUserForm.getByLabel('Email').fill(`${username}@example.org`);
      // ADMIN so the form does not also demand a group.
      await createUserForm.getByTestId('basePermissionLevel-select-trigger').click();
      await page.getByTestId('basePermissionLevel-select-item-ADMIN').click();
      await createUserForm.getByRole('button', { name: 'Submit' }).click();

      const fallback = page.getByTestId('welcome-email-fallback');
      await expect(fallback).toBeVisible({ timeout: 40_000 });
      // The message is the rendered template, so the admin can hand it over as-is.
      await expect(fallback).toContainText(username);
      await fallback.getByRole('button', { name: 'Done' }).click();
      await page.waitForURL('**/admin/users');
    });
  });

  test.describe('group manager navigation', () => {
    // The nav item is gated on `isMailEnabled`, so this is the only place it can be asserted.
    test('should offer the email templates page once mail is on', async ({ getPageModel, page }) => {
      await getPageModel('/dashboard');
      await expect(page.getByTestId('nav-button-/group/email-templates')).toBeVisible();
    });
  });

  test.describe('assignment email', () => {
    test('should offer the email form once mail is on, and report a delivery failure', async ({
      getPageModel,
      page,
      uniqueId
    }) => {
      const startSessionPage = await getPageModel('/session/start-session');
      await startSessionPage.sessionForm.waitFor({ state: 'visible' });
      await startSessionPage.selectIdentificationMethod('PERSONAL_INFO');
      await startSessionPage.fillSessionForm(`Mail${uniqueId}`, `Subject${uniqueId}`, 'Female');
      await startSessionPage.submitForm();
      await expect(startSessionPage.successMessage).toBeVisible();

      await page.getByTestId('nav-button-/session/remote-assignment').click();
      await page.waitForURL('**/session/remote-assignment');

      const remoteAssignmentPage = new RemoteAssignmentPage(page);
      await expect(remoteAssignmentPage.instrumentShowcase).toBeVisible();
      await remoteAssignmentPage.clickFirstInstrumentCard();
      await remoteAssignmentPage.submitAssignmentForm();

      // The form only renders when `isMailEnabled` is true, so its presence is the assertion that
      // the saved configuration actually reached the client.
      const emailForm = page.getByTestId('assignment-email-form');
      await expect(emailForm).toBeVisible();

      await page.getByTestId('assignment-email').fill('participant@example.org');
      await page.getByTestId('assignment-email-submit').click();

      const feedback = page.getByTestId('assignment-email-feedback');
      await expect(feedback).toBeVisible({ timeout: 40_000 });
      await expect(feedback).not.toContainText('ENOTFOUND');
    });
  });
});
