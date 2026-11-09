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

    await expect(legend.locator('..')).toHaveCSS('padding-top', '16px');
    const legendItems = legend.locator('.recharts-legend-item');
    await expect(legendItems.first()).toHaveCSS('margin-right', '16px');
    await expect(legendItems.first()).toHaveCSS('margin-left', '16px');

    const wrapperBox = (await dashboardPage.recordsSessionsChart.boundingBox())!;
    const firstItemBox = (await legendItems.first().boundingBox())!;
    const lastItemBox = (await legendItems.last().boundingBox())!;
    const itemsCentre = (firstItemBox.x + lastItemBox.x + lastItemBox.width) / 2;
    expect(Math.abs(itemsCentre - (wrapperBox.x + wrapperBox.width / 2))).toBeLessThan(2);
  });

  test('should redraw a chart over the time window chosen in its corner', async ({ getPageModel, page }) => {
    const dashboardPage = await getPageModel('/dashboard');
    await expect(dashboardPage.recordsTrendWindow).toHaveText('Default');
    await expect(dashboardPage.subjectsTrendWindow).toHaveText('Default');

    const response = page.waitForResponse((res) => {
      return res.url().includes('/v1/summary') && res.url().includes('recordTrendWindow=past5Years');
    });
    await dashboardPage.recordsTrendWindow.click();
    await page.getByRole('option', { name: 'Last 5 Years' }).click();
    const summary = (await (await response).json()) as { trends: { records: unknown[]; subjects: unknown[] } };

    expect(summary.trends.records).toHaveLength(6);
    expect(summary.trends.subjects).toHaveLength(5);
    await expect(dashboardPage.recordsTrendWindow).toHaveText('Last 5 Years');
    await expect(dashboardPage.subjectsTrendWindow).toHaveText('Default');
    // Only the x axis labels can hold a four-digit year; the y axis counts records.
    await expect(dashboardPage.recordsSessionsChart.getByRole('application')).toContainText(/\d{4}/);
  });

  test('should line each time window up with its chart title, near the card edge', async ({ getPageModel }) => {
    const dashboardPage = await getPageModel('/dashboard');
    for (const [chart, select] of [
      [dashboardPage.recordsSessionsChart, dashboardPage.recordsTrendWindow],
      [dashboardPage.subjectsGrowthChart, dashboardPage.subjectsTrendWindow]
    ] as const) {
      const cardBox = (await chart.boundingBox())!;
      const titleBox = (await chart.getByRole('heading').first().boundingBox())!;
      const selectBox = (await select.boundingBox())!;
      expect(Math.abs(selectBox.y + selectBox.height / 2 - (titleBox.y + titleBox.height / 2))).toBeLessThan(2);
      expect(cardBox.x + cardBox.width - (selectBox.x + selectBox.width)).toBeLessThanOrEqual(17);
    }
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

  test('should find a user of the group by searching the users dialog', async ({ api, authenticateAs, page }) => {
    const group = await api.createGroup();
    const { credentials } = await api.createUser({ basePermissionLevel: 'GROUP_MANAGER', groupIds: [group.id] });
    const { credentials: colleague } = await api.createUser({ groupIds: [group.id] });
    await authenticateAs(credentials);

    const dashboardPage = new DashboardPage(page);
    await dashboardPage.goto('/dashboard');
    await dashboardPage.statisticUsers.click();
    const userRows = dashboardPage.usersDialog.getByTestId('data-table-row');
    await expect(userRows).toHaveCount(2);
    await dashboardPage.usersDialog.getByRole('searchbox').fill(colleague.username);
    await expect(userRows).toHaveCount(1);
    await expect(userRows).toHaveText(colleague.username);
  });

  // The dialogs show their tables as plain text, with larger bold headers in place of the borders.
  test('should show the tables in the dashboard dialogs as text, without borders', async ({ getPageModel, page }) => {
    const dashboardPage = await getPageModel('/dashboard');
    for (const [statistic, dialog] of [
      [dashboardPage.statisticUsers, dashboardPage.usersDialog],
      [dashboardPage.statisticInstruments, dashboardPage.instrumentsDialog],
      [dashboardPage.statisticRecords, dashboardPage.recordsDialog]
    ] as const) {
      await statistic.click();
      const frame = dialog.getByTestId('data-table').locator('> .border');
      await expect(frame).toHaveCSS('border-top-width', '0px');
      for (const cell of [
        dialog.getByTestId('data-table-row').first(),
        frame.getByTestId('data-table-head').locator('> div > div').first()
      ]) {
        await expect(cell).toHaveCSS('border-bottom-width', '0px');
        await expect(cell).toHaveCSS('border-right-width', '0px');
      }
      await expect(frame.getByTestId('data-table-head')).toHaveCSS('font-weight', '700');
      await expect(frame.getByTestId('data-table-head')).toHaveCSS('font-size', '16px');
      await page.keyboard.press('Escape');
    }
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
    const instrumentRows = dashboardPage.instrumentsDialog.getByTestId('data-table-row');
    await dashboardPage.instrumentsDialog.getByRole('searchbox').fill(title);
    await expect(instrumentRows).toHaveCount(1);
    await expect(instrumentRows.getByTestId('instrument-cell-kind')).toHaveText('Form');
    await dashboardPage.instrumentsDialog.getByRole('searchbox').fill('');
    const instrumentRowCount = await dashboardPage.countDialogRows(dashboardPage.instrumentsDialog);
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
