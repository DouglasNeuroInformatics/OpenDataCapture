import { DashboardPage } from '../pages/_app/dashboard.page';
import { expect, test } from '../support/fixtures';

test.describe('group switcher', () => {
  test('should let an admin switch into a group they do not belong to, and scope the dashboard to it', async ({
    api,
    authenticateAs,
    page
  }) => {
    const memberGroup = await api.createGroup();
    const otherGroup = await api.createGroup();
    const { credentials } = await api.createUser({ basePermissionLevel: 'ADMIN', groupIds: [memberGroup.id] });
    await authenticateAs(credentials);

    const dashboardPage = new DashboardPage(page);
    await dashboardPage.goto('/dashboard');
    await expect(dashboardPage.groupSwitcher).toContainText(memberGroup.name);

    const scopedSummary = page.waitForRequest(
      (request) =>
        new URL(request.url()).pathname === '/v1/summary' &&
        new URL(request.url()).searchParams.get('groupId') === otherGroup.id
    );
    await dashboardPage.switchGroup(otherGroup.name);
    await scopedSummary;
  });

  test('should start an admin who belongs to no group with none selected, and offer them every group', async ({
    api,
    authenticateAs,
    page
  }) => {
    const group = await api.createGroup();
    const { credentials } = await api.createUser({ basePermissionLevel: 'ADMIN', groupIds: [] });
    await authenticateAs(credentials);

    const dashboardPage = new DashboardPage(page);
    await dashboardPage.goto('/dashboard');
    await expect(dashboardPage.groupSwitcher).toContainText('Select a group');

    await dashboardPage.switchGroup(group.name);
  });

  test('should offer a group manager only the groups they belong to', async ({ api, authenticateAs, page }) => {
    const memberGroups = [await api.createGroup(), await api.createGroup()];
    const otherGroup = await api.createGroup();
    const { credentials } = await api.createUser({
      basePermissionLevel: 'GROUP_MANAGER',
      groupIds: memberGroups.map((group) => group.id)
    });
    await authenticateAs(credentials);

    const dashboardPage = new DashboardPage(page);
    await dashboardPage.goto('/dashboard');

    const options = await dashboardPage.openGroupSwitcher();
    await expect(options).toHaveCount(memberGroups.length);
    for (const group of memberGroups) {
      await expect(options.filter({ hasText: group.name })).toBeVisible();
    }
    await expect(options.filter({ hasText: otherGroup.name })).toHaveCount(0);
  });
});
