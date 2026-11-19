import { ApiClient } from '../support/api-client';
import { ADMIN } from '../support/constants';
import { expect, test } from '../support/fixtures';

test.describe('admin audit logs', () => {
  test.use({ actingRole: 'ADMIN' });

  // Only `Login` (via `auth.service.ts`) and assignment actions (via `assignments.service.ts`)
  // actually call `AuditLogger.log`; creating a group, user, instrument, subject etc. is not audited
  // despite the Entity filter offering those options -- see #1473. Login is therefore the
  // only auditable action this spec can reliably trigger and verify.
  test('should record a login, find it through the action filter and download the logs', async ({
    apiRequestContext,
    getPageModel
  }) => {
    // `getPageModel('ADMIN')` reuses a token cached once per worker (see `roleAccount` in fixtures.ts),
    // so it would not itself produce a fresh entry here. Logging in directly does.
    await ApiClient.login(apiRequestContext, { password: ADMIN.password, username: ADMIN.username });

    const auditLogsPage = await getPageModel('/admin/audit/logs');
    await expect(auditLogsPage.pageHeader).toContainText('Audit Logs');
    await auditLogsPage.filterBy('action', 'Login');

    await expect(auditLogsPage.filterButton('action')).toContainText('Login');
    await expect(auditLogsPage.$ref).toHaveURL(/action=LOGIN/);
    const firstRow = auditLogsPage.dataTable.getByTestId('data-table-row').first();
    await expect(firstRow).toContainText('User');
    await expect(firstRow.getByTestId('audit-log-action')).toHaveText('Login');

    const downloadPromise = auditLogsPage.$ref.waitForEvent('download');
    await auditLogsPage.downloadButton.click();
    expect((await downloadPromise).suggestedFilename()).toMatch(/^ODC_Audit_Logs_\d+\.json$/);
  });
});
