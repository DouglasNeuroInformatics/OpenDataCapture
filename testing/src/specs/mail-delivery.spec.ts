import { RemoteAssignmentPage } from '../pages/_app/session/remote-assignment.page';
import { expect, test } from '../support/fixtures';

// `isMailEnabled` is instance-wide, and every other spec runs with mail off. Turning it on has to
// be undone in the same file, and these tests must not interleave with each other while it is on.
test.describe.configure({ mode: 'serial' });

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
