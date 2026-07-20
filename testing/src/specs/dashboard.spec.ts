import { ApiClient } from '../support/api-client';
import { expect, test } from '../support/fixtures';

test.describe('dashboard', () => {
  test('should display the dashboard header @smoke', async ({ getPageModel }) => {
    const dashboardPage = await getPageModel('/dashboard');
    await expect(dashboardPage.pageHeader).toBeVisible();
    await expect(dashboardPage.pageHeader).toContainText('Dashboard');
  });

  // The default acting role's group is seeded as CLINICAL by the `api` fixture (api-client.ts).
  test('should summarize the acting group and its statistics for a group manager', async ({ getPageModel }) => {
    const dashboardPage = await getPageModel('/dashboard');
    await expect(dashboardPage.welcomeHeading).toContainText('Overview of Your Clinic');
    await expect(dashboardPage.statisticUsers).toContainText(/Total Users/);
    await expect(dashboardPage.statisticSubjects).toContainText(/Total Subjects/);
    await expect(dashboardPage.statisticInstruments).toContainText(/Total Instruments/);
    await expect(dashboardPage.statisticRecords).toContainText(/Total Records/);
    await expect(dashboardPage.recordsSessionsChart).toBeVisible();
    await expect(dashboardPage.subjectsGrowthChart).toBeVisible();
  });

  test('should navigate to the data hub when the subjects statistic is clicked', async ({ getPageModel, page }) => {
    const dashboardPage = await getPageModel('/dashboard');
    await dashboardPage.statisticSubjects.click();
    await expect(page).toHaveURL('/datahub');
  });

  test('should open a dialog listing users when the users statistic is clicked', async ({ getPageModel }) => {
    const dashboardPage = await getPageModel('/dashboard');
    await dashboardPage.statisticUsers.click();
    await expect(dashboardPage.usersDialog).toBeVisible();
    await expect(dashboardPage.usersDialog).toContainText('Users');
  });

  test.describe('as an administrator', () => {
    test.use({ actingRole: 'ADMIN' });

    // The seeded admin account belongs to no group, so the dashboard falls back to the
    // application-wide summary rather than a clinic- or research-group-scoped one.
    test('should summarize the whole application rather than a single group', async ({ getPageModel }) => {
      const dashboardPage = await getPageModel('/dashboard');
      await expect(dashboardPage.welcomeHeading).toContainText('Summary of Application State');
    });
  });

  // A session was previously given its groupId only when the subject was not already a member of
  // that group, so every visit after a subject's first was created without one. A group manager's
  // Session rule is `{ groupId: { in: [...] } }`, which made those sessions invisible to them and
  // uncounted by every group-scoped query, this dashboard included.
  //
  // Seeded into a group of its own, so the count is exactly what this test created.
  test('should keep a returning subject later sessions visible to their group manager', async ({
    api,
    apiRequestContext,
    uniqueId
  }) => {
    const group = await api.createGroup();
    const { credentials } = await api.createUser({ basePermissionLevel: 'GROUP_MANAGER', groupIds: [group.id] });
    const accessToken = await ApiClient.login(apiRequestContext, credentials);
    const subjectId = `revisit-${uniqueId}`;

    await api.createSession(group.id, { id: subjectId });
    await api.createSession(group.id, { id: subjectId });

    const response = await apiRequestContext.get(`/api/v1/sessions?groupId=${group.id}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    expect(response.status()).toBe(200);
    const sessions = (await response.json()) as { subjectId: string }[];
    expect(sessions.filter((session) => session.subjectId === subjectId)).toHaveLength(2);
  });
});
