import { ApiClient } from '../support/api-client';
import { ADMIN } from '../support/constants';
import { expect, test } from '../support/fixtures';

test.describe('admin audit logs', () => {
  test.use({ actingRole: 'ADMIN' });

  test('should show the audit logs table', async ({ getPageModel }) => {
    const auditLogsPage = await getPageModel('/admin/audit/logs');

    await expect(auditLogsPage.pageHeader).toContainText('Audit Logs');
    await expect(auditLogsPage.dataTable).toBeVisible();
  });

  // Only `Login` (via `auth.service.ts`) and assignment actions (via `assignments.service.ts`)
  // actually call `AuditLogger.log`; creating a group, user, instrument, subject etc. is not audited
  // despite the Entity filter offering those options -- see #1473. Login is therefore the
  // only auditable action this spec can reliably trigger and verify.
  test('should record a login and find it through the action filter', async ({ apiRequestContext, getPageModel }) => {
    // `getPageModel('ADMIN')` reuses a token cached once per worker (see `roleAccount` in fixtures.ts),
    // so it would not itself produce a fresh entry here. Logging in directly does.
    await ApiClient.login(apiRequestContext, { password: ADMIN.password, username: ADMIN.username });

    const auditLogsPage = await getPageModel('/admin/audit/logs');
    await auditLogsPage.filterBy('action', 'Login');

    const firstRow = auditLogsPage.dataTable.getByTestId('data-table-row').first();
    await expect(firstRow).toContainText('Login');
    await expect(firstRow).toContainText('User');
  });

  test('should show the chosen option on its filter button and put it in the URL', async ({ getPageModel }) => {
    const auditLogsPage = await getPageModel('/admin/audit/logs');
    await auditLogsPage.filterBy('entity', 'Session');

    await expect(auditLogsPage.filterButton('entity')).toContainText('Session');
    await expect(auditLogsPage.$ref).toHaveURL(/entity=SESSION/);
  });

  test('should clear every filter at once', async ({ getPageModel }) => {
    const auditLogsPage = await getPageModel('/admin/audit/logs');
    await expect(auditLogsPage.clearFiltersButton).toBeHidden();

    await auditLogsPage.filterBy('action', 'Login');
    await auditLogsPage.filterBy('entity', 'User');
    await auditLogsPage.clearFiltersButton.click();

    await expect(auditLogsPage.clearFiltersButton).toBeHidden();
    await expect(auditLogsPage.$ref).not.toHaveURL(/action=|entity=/);
    await expect(auditLogsPage.filterButton('action')).toHaveText('Action');
  });

  test('should download the audit logs as JSON', async ({ getPageModel }) => {
    const auditLogsPage = await getPageModel('/admin/audit/logs');

    const downloadPromise = auditLogsPage.$ref.waitForEvent('download');
    await auditLogsPage.downloadButton.click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/^ODC_Audit_Logs_\d+\.json$/);
  });
});
