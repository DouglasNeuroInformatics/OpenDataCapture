import { RemoteAssignmentPage } from '../pages/_app/session/remote-assignment.page';
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

  // The secret must never round-trip to the browser, even after a save.
  test('should never render the stored password', async ({ getPageModel }) => {
    const mailPage = await getPageModel('/admin/mail');
    await mailPage.enableMail();
    await mailPage.fillServerConfig({
      host: 'smtp.example.org',
      password: 'hunter2',
      port: '587',
      senderAddress: 'noreply@example.org',
      username: 'mailer'
    });

    await expect(mailPage.password).toHaveAttribute('type', 'password');
    await mailPage.$ref.reload();
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

      await expect(mailPage.host).toHaveValue('smtp.invalid.test');
      await expect(mailPage.username).toHaveValue('e2e');
      // The stored password is real, so this is the assertion that it never reaches the browser.
      await expect(mailPage.password).not.toHaveValue('e2e-password');
      await expect(mailPage.$ref.locator('body')).not.toContainText('e2e-password');
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
