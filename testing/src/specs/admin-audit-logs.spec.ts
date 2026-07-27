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
    // `getPageModel('ADMIN')` reuses a token cached once per worker (see `roleToken` in fixtures.ts),
    // so it would not itself produce a fresh entry here. Logging in directly does.
    await ApiClient.login(apiRequestContext, { password: ADMIN.password, username: ADMIN.username });

    const auditLogsPage = await getPageModel('/admin/audit/logs');
    await auditLogsPage.filterBy('Login');

    const firstRow = auditLogsPage.dataTable.getByTestId('data-table-row').first();
    await expect(firstRow).toContainText('Login');
    await expect(firstRow).toContainText('User');
  });

  test('should download the audit logs as JSON', async ({ getPageModel }) => {
    const auditLogsPage = await getPageModel('/admin/audit/logs');

    const downloadPromise = auditLogsPage.$ref.waitForEvent('download');
    await auditLogsPage.downloadButton.click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/^ODC_Audit_Logs_\d+\.json$/);
  });
});
