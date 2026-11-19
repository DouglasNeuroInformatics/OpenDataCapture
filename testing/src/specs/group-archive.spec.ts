import type { Page } from '@playwright/test';

import { expect, test } from '../support/fixtures';

/** Opens the manage sheet of the one group the admin groups table is filtered down to. */
async function openManageSheet(page: Page, groupName: string) {
  await page.getByTestId('data-table-search-bar').getByRole('searchbox').fill(groupName);
  const row = page.getByTestId('data-table-row');
  await expect(row).toHaveCount(1);
  await row.getByTestId('row-actions-trigger').click();
  await page.getByTestId('row-actions-dropdown').getByRole('menuitem', { name: 'Manage' }).click();
  return row;
}

test.describe('group archiving', () => {
  test('should let an admin archive a group from its manage sheet and unarchive it again', async ({
    api,
    authenticateAs,
    page,
    uniqueId
  }) => {
    const group = await api.createGroup({ name: `Archived Group ${uniqueId}` });
    await authenticateAs('ADMIN');
    await page.goto('/admin/groups');

    const row = await openManageSheet(page, group.name);
    await page.getByRole('button', { exact: true, name: 'Archive' }).click();
    await page.getByTestId('confirm-archive-group').click();

    await expect(page.getByRole('heading', { name: 'Success' }).last()).toBeVisible();
    await expect(row.getByTestId('group-status-archived')).toBeVisible();
    expect((await api.findGroupById(group.id)).archivedAt).toBeTruthy();

    await openManageSheet(page, group.name);
    await page.getByRole('button', { exact: true, name: 'Unarchive' }).click();

    await expect(row.getByTestId('group-status-active')).toBeVisible();
    expect((await api.findGroupById(group.id)).archivedAt).toBeFalsy();
  });
});
