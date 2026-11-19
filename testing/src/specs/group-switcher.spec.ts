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

    const scopedSummary = page.waitForRequest((request) => {
      return (
        new URL(request.url()).pathname === '/v1/summary' &&
        new URL(request.url()).searchParams.get('groupId') === otherGroup.id
      );
    });
    await dashboardPage.switchGroup(otherGroup.name);
    await scopedSummary;
  });

  // The seeded admin account belongs to no group, so the dashboard falls back to the application-wide
  // summary. An archived group grants nothing, so it is no group to switch into.
  test('should start an admin who belongs to no group on the whole application, offering every group but an archived one', async ({
    api,
    authenticateAs,
    page
  }) => {
    const [group, archivedGroup, { credentials }] = await Promise.all([
      api.createGroup(),
      api.createGroup(),
      api.createUser({ basePermissionLevel: 'ADMIN', groupIds: [] })
    ]);
    await api.archiveGroup(archivedGroup.id);
    await authenticateAs(credentials);

    const dashboardPage = new DashboardPage(page);
    await dashboardPage.goto('/dashboard');
    await expect(dashboardPage.groupSwitcher).toContainText('Select a group');
    await expect(dashboardPage.welcomeHeading).toContainText('Summary of Application State');

    const options = await dashboardPage.openGroupSwitcher();
    await expect(options.filter({ hasText: archivedGroup.name })).toHaveCount(0);
    await options.filter({ hasText: group.name }).click();
    await expect(dashboardPage.groupSwitcher).toContainText(group.name);
  });

  // The archived group is listed first, so a client that took the first of the user's groups as the
  // current one without dropping archived groups would select it.
  test('should offer a group manager only the active groups they belong to, and never start them in an archived one', async ({
    api,
    authenticateAs,
    page
  }) => {
    const [archivedGroup, firstGroup, secondGroup, otherGroup] = await Promise.all([
      api.createGroup(),
      api.createGroup(),
      api.createGroup(),
      api.createGroup()
    ]);
    const memberGroups = [firstGroup, secondGroup];
    const { credentials } = await api.createUser({
      basePermissionLevel: 'GROUP_MANAGER',
      groupIds: [archivedGroup.id, ...memberGroups.map((group) => group.id)]
    });
    await api.archiveGroup(archivedGroup.id);
    await authenticateAs(credentials);

    const dashboardPage = new DashboardPage(page);
    await dashboardPage.goto('/dashboard');
    await expect(dashboardPage.groupSwitcher).toContainText(new RegExp(`${firstGroup.name}|${secondGroup.name}`));
    await expect(dashboardPage.groupSwitcher).not.toContainText(archivedGroup.name);

    const options = await dashboardPage.openGroupSwitcher();
    await expect(options).toHaveCount(memberGroups.length);
    for (const group of memberGroups) {
      await expect(options.filter({ hasText: group.name })).toBeVisible();
    }
    await expect(options.filter({ hasText: archivedGroup.name })).toHaveCount(0);
    await expect(options.filter({ hasText: otherGroup.name })).toHaveCount(0);
  });
});
