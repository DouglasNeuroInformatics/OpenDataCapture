import { DashboardPage } from '../pages/_app/dashboard.page';
import { expect, test } from '../support/fixtures';

function scoreFormBundle({ edition, name, title }: { edition: number; name: string; title: string }) {
  return `(async () => {
    const runtimeImport = (specifier) => import(globalThis.__resolveImport?.(specifier) ?? specifier);
    const { z } = await runtimeImport('/runtime/v1/zod@3.x/index.js');
    return {
      __runtimeVersion: 1,
      content: { score: { kind: 'number', label: 'Score', variant: 'input' } },
      details: { description: 'A form with one number field', license: 'Apache-2.0', title: ${JSON.stringify(title)} },
      internal: { edition: ${edition}, name: ${JSON.stringify(name)} },
      kind: 'FORM',
      language: 'en',
      measures: null,
      tags: [],
      validationSchema: z.object({ score: z.number() })
    };
  })()`;
}

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

  test('should label the trend series in a visible legend without requiring hover', async ({ getPageModel }) => {
    const dashboardPage = await getPageModel('/dashboard');
    const legend = dashboardPage.recordsSessionsChart.locator('.recharts-default-legend');
    await expect(legend).toBeVisible();
    await expect(legend).toContainText('Records');
    await expect(legend).toContainText('Sessions');

    const recordsIcon = legend.locator('.recharts-legend-item').filter({ hasText: 'Records' }).locator('line');
    const sessionsIcon = legend.locator('.recharts-legend-item').filter({ hasText: 'Sessions' }).locator('line');

    await expect(recordsIcon).not.toHaveAttribute('stroke-dasharray', '6 4');
    await expect(sessionsIcon).toHaveAttribute('stroke-dasharray', '6 4');
  });

  test('should navigate to the data hub when the subjects statistic is clicked', async ({ getPageModel, page }) => {
    const dashboardPage = await getPageModel('/dashboard');
    await dashboardPage.statisticSubjects.click();
    await expect(page).toHaveURL('/datahub/subjects');
  });

  test('should open a dialog listing users when the users statistic is clicked', async ({ getPageModel }) => {
    const dashboardPage = await getPageModel('/dashboard');
    await dashboardPage.statisticUsers.click();
    await expect(dashboardPage.usersDialog).toBeVisible();
    await expect(dashboardPage.usersDialog).toContainText('Users');
  });

  // A record keeps the id of the edition it was collected with, so the records dialog once counted
  // only the latest edition's records, and the instruments card counted every edition in the database.
  // Edition 2 is stored after the group exists, so the group gains it the way an upgrade does.
  test('should count the records of every edition of an instrument, matching both cards to their dialogs', async ({
    api,
    authenticateAs,
    page,
    uniqueId
  }) => {
    const name = `DASHBOARD_EDITIONS_${uniqueId}`;
    const title = `Dashboard Editions ${uniqueId}`;
    const editionOneId = await api.createInstrument(scoreFormBundle({ edition: 1, name, title }));
    const group = await api.createGroup();
    const editionTwoId = await api.createInstrument(scoreFormBundle({ edition: 2, name, title }));
    const session = await api.createSession(group.id, { id: `dashboard_editions_${uniqueId}` });
    for (const instrumentId of [editionOneId, editionOneId, editionOneId, editionTwoId, editionTwoId]) {
      await api.createRecord(group.id, instrumentId, session, { score: 1 });
    }
    const { credentials } = await api.createUser({ basePermissionLevel: 'GROUP_MANAGER', groupIds: [group.id] });
    await authenticateAs(credentials);

    const dashboardPage = new DashboardPage(page);
    await dashboardPage.goto('/dashboard');

    await expect(dashboardPage.statisticRecords.getByRole('heading')).toHaveText('5');
    await dashboardPage.statisticRecords.click();
    // The only instrument holding records in this group, so the default most-records-first order puts it on top.
    const recordRows = dashboardPage.recordsDialog.getByTestId('data-table-row');
    await expect(recordRows.first()).toHaveText(new RegExp(`^${title}\\s*5$`));
    await dashboardPage.recordsDialog.getByRole('searchbox').fill(title);
    await expect(recordRows).toHaveCount(1);
    await expect(recordRows).toHaveText(new RegExp(`^${title}\\s*5$`));
    await page.keyboard.press('Escape');

    await dashboardPage.statisticInstruments.click();
    const instrumentRows = dashboardPage.instrumentsDialog.getByRole('listitem');
    await expect(instrumentRows.filter({ hasText: title })).toHaveCount(1);
    const instrumentRowCount = await instrumentRows.count();
    await page.keyboard.press('Escape');
    await expect(dashboardPage.statisticInstruments.getByRole('heading')).toHaveText(String(instrumentRowCount));
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
