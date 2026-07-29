import { expect, test } from '../support/fixtures';

test.use({ actingRole: 'ADMIN' });

test.describe('mail settings', () => {
  test('should hide the server configuration until email is enabled', async ({ getPageModel }) => {
    const mailPage = await getPageModel('/admin/mail');

    await expect(mailPage.enableToggle).toBeVisible();
    await expect(mailPage.serverCard).toBeHidden();

    await mailPage.enableMail();
    await expect(mailPage.host).toBeVisible();
  });

  test('should reject an incomplete configuration without saving it', async ({ getPageModel }) => {
    const mailPage = await getPageModel('/admin/mail');
    await mailPage.enableMail();

    await mailPage.saveConfig.click();

    await expect(mailPage.fieldError('host')).toBeVisible();
    await expect(mailPage.fieldError('username')).toBeVisible();
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
