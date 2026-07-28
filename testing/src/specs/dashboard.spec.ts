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
});
