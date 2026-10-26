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

test.describe('admin audit logs sorting', () => {
  test.use({ actingRole: 'ADMIN' });

  test('should request the oldest logs first on the first click of the time header', async ({ getPageModel }) => {
    const auditLogsPage = await getPageModel('/admin/audit/logs');

    const ascendingRequest = auditLogsPage.$ref.waitForRequest(
      (request) => request.url().includes('/v1/audit/logs') && request.url().includes('sortOrder=asc')
    );
    await auditLogsPage.timeHeaderButton.click();

    await ascendingRequest;
  });
});

test.describe('admin audit logs fetching', () => {
  test.use({ actingRole: 'ADMIN' });

  test('should fetch the logs once per navigation, not again when the table mounts', async ({ getPageModel, page }) => {
    const auditLogsRequests: string[] = [];
    page.on('request', (request) => {
      if (request.method() === 'GET' && new URL(request.url()).pathname.endsWith('/v1/audit/logs')) {
        auditLogsRequests.push(request.url());
      }
    });

    const auditLogsPage = await getPageModel('/admin/audit/logs');
    const firstRow = auditLogsPage.dataTable.getByTestId('data-table-row').first();
    await expect(firstRow).toBeVisible();
    await page.waitForLoadState('networkidle');
    expect(auditLogsRequests).toHaveLength(1);

    await auditLogsPage.filterBy('action', 'Login');
    await expect(auditLogsPage.$ref).toHaveURL(/action=LOGIN/);
    await expect(firstRow).toContainText('Login');
    await page.waitForLoadState('networkidle');
    expect(auditLogsRequests).toHaveLength(2);
  });
});
