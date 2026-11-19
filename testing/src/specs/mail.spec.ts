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

  // The whole save path — validate, persist, re-seed from the response — while the secret
  // itself never round-trips back to the browser.
  test('should save a valid configuration without ever rendering the stored password', async ({ getPageModel }) => {
    const settingsPage = await getPageModel('/admin/settings');
    await settingsPage.openTab('mail');
    await settingsPage.enableMail();
    await settingsPage.fillMailServerConfig({
      host: 'smtp.saved.test',
      password: 'hunter2',
      port: '2525',
      senderAddress: 'sender@example.org',
      username: 'saver'
    });

    // Turning mail on raised a success notification of its own, so only the response says this save landed.
    const saved = settingsPage.waitForMailSave();
    await settingsPage.mailSaveConfig.click();
    expect((await saved).ok()).toBe(true);

    // The reload proves the save reached the database, not merely component state. It reopens the
    // mail tab without a click, because the chosen tab is held in the address.
    await settingsPage.$ref.reload();
    await expect(settingsPage.tabPanel('mail')).toBeVisible();
    await settingsPage.enableMail();
    await expect(settingsPage.mailHost).toHaveValue('smtp.saved.test');
    await expect(settingsPage.mailUsername).toHaveValue('saver');
    await expect(settingsPage.mailPort).toHaveValue('2525');
    await expect(settingsPage.mailPassword).toHaveAttribute('type', 'password');
    await expect(settingsPage.mailPassword).not.toHaveValue('hunter2');
    await expect(settingsPage.$ref.locator('body')).not.toContainText('hunter2');
  });
});

test.describe('mail delivery', () => {
  test.beforeAll(async ({ api }) => {
    await api.setMailEnabled(true);
  });

  test.afterAll(async ({ api }) => {
    await api.setMailEnabled(false);
  });

  test.describe('admin mail settings', () => {
    test.use({ actingRole: 'ADMIN' });

    test('should report a failed connection test in the reader’s language, not raw SMTP prose', async ({
      getPageModel
    }) => {
      const settingsPage = await getPageModel('/admin/settings');
      await settingsPage.openTab('mail');

      await settingsPage.mailTestConnection.click();

      // `smtp.invalid.test` cannot resolve, so this exercises the whole failure path: nodemailer
      // error -> MailErrorCode -> localized copy. A raw driver message would leak "ENOTFOUND".
      const notification = settingsPage.$ref.getByText(/could not be found|check and reconfigure/i);
      await expect(notification.first()).toBeVisible({ timeout: 40_000 });
      await expect(settingsPage.$ref.locator('body')).not.toContainText('ENOTFOUND');
    });
  });

  test.describe('assignment email', () => {
    // Every admin reads the audit log and can download it whole, so it records the domain an
    // assignment link went to, never the participant's address.
    test('should record only a masked recipient in the audit log', async ({ api, uniqueId }) => {
      const recipient = `participant${uniqueId}@example.org`;
      const group = await api.createGroup();
      const assignment = await api.createAssignment({
        expiresAt: new Date(Date.now() + 86_400_000),
        groupId: group.id,
        instrumentId: await api.findInstrumentId('FORM'),
        subjectId: await api.createSubject(group.id)
      });

      const result = await api.sendAssignmentEmail(assignment.id, { language: 'en', recipient });
      expect(result.status).toBe('FAILED');

      const entries = await api.findAuditLogs('SEND_EMAIL');
      const entry = entries.find(({ metadata }) => metadata?.assignmentId === assignment.id);
      expect(entry?.metadata?.recipient).toBe('p***@example.org');
      expect(JSON.stringify(entries)).not.toContain(recipient);
    });
  });
});
