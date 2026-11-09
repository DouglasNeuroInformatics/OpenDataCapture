import { ApiClient } from '../support/api-client';
import { ADMIN } from '../support/constants';
import { expect, test } from '../support/fixtures';

test.describe('table sorting', () => {
  test.use({ actingRole: 'ADMIN' });

  test('should offer a working sort on every column of the audit log, ordered by the server', async ({
    getPageModel,
    page
  }) => {
    const auditLogsPage = await getPageModel('/admin/audit/logs');
    const head = auditLogsPage.dataTable.getByTestId('data-table-head');

    for (const [name, sortBy] of [
      ['User', 'user'],
      ['Active Group', 'group'],
      ['Action', 'action'],
      ['Entity', 'entity']
    ] as const) {
      const response = page.waitForResponse((res) => res.url().includes(`sortBy=${sortBy}`));
      await head.getByRole('button', { name }).click();
      expect((await response).status()).toBe(200);
      await expect(auditLogsPage.dataTable.getByTestId('data-table-row').first()).toBeVisible();
    }
  });

  // Status is derived and failure count is an array length, so these reach Mongo as a composite
  // ordering only a real database can prove accepted.
  test('should accept every sync log ordering against the real database', async ({ apiRequestContext }) => {
    const token = await ApiClient.login(apiRequestContext, { password: ADMIN.password, username: ADMIN.username });
    for (const sortBy of ['action', 'createdAt', 'failedCount', 'importedCount', 'repoName', 'status']) {
      const response = await apiRequestContext.get('/api/v1/instrument-repos/sync/logs', {
        headers: { Authorization: `Bearer ${token}` },
        params: { sortBy }
      });
      expect(response.status()).toBe(200);
    }
  });

  test('should reorder the users when a column header is clicked', async ({ authenticateAs, page }) => {
    await authenticateAs('ADMIN');
    await page.goto('/admin/users');
    const head = page.getByTestId('data-table-head');
    const firstRow = page.getByTestId('data-table-row').first();
    await head.getByRole('button', { name: 'Username' }).click();
    const ascending = await firstRow.textContent();
    await head.getByRole('button', { name: 'Username' }).click();
    await expect(firstRow).not.toHaveText(ascending!);
  });

  test('should offer a sort on every column of the group table', async ({ authenticateAs, page }) => {
    await authenticateAs('ADMIN');
    await page.goto('/admin/groups');
    const head = page.getByTestId('data-table-head');
    await expect(head.getByRole('button', { name: 'Group Name' })).toBeVisible();
    await expect(head.getByRole('button', { name: 'Group Type' })).toBeVisible();
  });

  test('should offer a sort on every column of the instruments table', async ({ getPageModel, page }) => {
    await getPageModel('/admin/instruments');
    const head = page.getByTestId('data-table-head');
    for (const name of ['Name', 'Source', 'Groups Using It', 'Kind', 'Edition', 'Added']) {
      await expect(head.getByRole('button', { name })).toBeVisible();
    }
  });
});
