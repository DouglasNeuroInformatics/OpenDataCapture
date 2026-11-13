import type { $LoginCredentials } from '@opendatacapture/schemas/auth';
import type { APIRequestContext, Page } from '@playwright/test';

import { DashboardPage } from '../pages/_app/dashboard.page';
import { ApiClient } from '../support/api-client';
import { expect, test } from '../support/fixtures';

const API = '/api/v1';

/** Opens the manage sheet of the one group the admin groups table is filtered down to. */
async function openManageSheet(page: Page, groupName: string) {
  await page.getByTestId('data-table-search-bar').getByRole('searchbox').fill(groupName);
  const row = page.getByTestId('data-table-row');
  await expect(row).toHaveCount(1);
  await row.getByTestId('row-actions-trigger').click();
  await page.getByTestId('row-actions-dropdown').getByRole('menuitem', { name: 'Manage' }).click();
  return row;
}

/**
 * The statuses a member gets reading their group and a subject in it, signing in afresh each time:
 * an archive reaches a member only through the token they are issued next.
 */
async function readAsMember(
  request: APIRequestContext,
  credentials: $LoginCredentials,
  groupId: string,
  subjectId: string
) {
  const headers = { Authorization: `Bearer ${await ApiClient.login(request, credentials)}` };
  const [group, subject] = await Promise.all([
    request.get(`${API}/groups/${groupId}`, { headers }),
    request.get(`${API}/subjects/${subjectId}`, { headers })
  ]);
  return { group: group.status(), subject: subject.status() };
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

  test('should take an archived group away from its members once they sign in again, and give it back on unarchive', async ({
    api,
    apiRequestContext
  }) => {
    const group = await api.createGroup();
    const subjectId = await api.createSubject(group.id);
    const { credentials } = await api.createUser({ basePermissionLevel: 'GROUP_MANAGER', groupIds: [group.id] });

    expect(await readAsMember(apiRequestContext, credentials, group.id, subjectId)).toStrictEqual({
      group: 200,
      subject: 200
    });

    await api.archiveGroup(group.id);
    expect(await readAsMember(apiRequestContext, credentials, group.id, subjectId)).toStrictEqual({
      group: 404,
      subject: 404
    });

    await api.unarchiveGroup(group.id);
    expect(await readAsMember(apiRequestContext, credentials, group.id, subjectId)).toStrictEqual({
      group: 200,
      subject: 200
    });
  });

  test('should no longer offer a member an archived group as their current group', async ({
    api,
    authenticateAs,
    page
  }) => {
    const archivedGroup = await api.createGroup();
    const activeGroup = await api.createGroup();
    const { credentials } = await api.createUser({
      basePermissionLevel: 'GROUP_MANAGER',
      groupIds: [archivedGroup.id, activeGroup.id]
    });
    await api.archiveGroup(archivedGroup.id);
    await authenticateAs(credentials);

    const dashboardPage = new DashboardPage(page);
    await dashboardPage.goto('/dashboard');

    // One group left to choose from, so the switcher shows it as the selected group's name.
    await expect(dashboardPage.groupSwitcher).toContainText(activeGroup.name);
    await expect(dashboardPage.groupSwitcher).not.toContainText(archivedGroup.name);
  });

  test('should not offer an admin an archived group in the group switcher', async ({ api, authenticateAs, page }) => {
    const archivedGroup = await api.createGroup();
    await api.archiveGroup(archivedGroup.id);
    const { credentials } = await api.createUser({ basePermissionLevel: 'ADMIN', groupIds: [] });
    await authenticateAs(credentials);

    const dashboardPage = new DashboardPage(page);
    await dashboardPage.goto('/dashboard');
    const options = await dashboardPage.openGroupSwitcher();
    await expect(options.first()).toBeVisible();
    await expect(options.filter({ hasText: archivedGroup.name })).toHaveCount(0);
  });
});
