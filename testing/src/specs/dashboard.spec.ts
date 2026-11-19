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
  // The default acting role's group is seeded as CLINICAL by the `api` fixture (api-client.ts). The
  // geometry and computed styles here are what happy-dom cannot measure; what the page shows and
  // requests is in apps/web's dashboard.test.tsx.
  test("should lay out a group manager's dashboard: its summary, chart legends and windows, and borderless dialog tables", async ({
    getPageModel,
    page
  }) => {
    const dashboardPage = await getPageModel('/dashboard');
    await expect(dashboardPage.pageHeader).toContainText('Dashboard');
    await expect(dashboardPage.welcomeHeading).toContainText('Overview of Your Clinic');
    await expect(dashboardPage.statisticUsers).toContainText(/Total Users/);
    await expect(dashboardPage.statisticSubjects).toContainText(/Total Subjects/);
    await expect(dashboardPage.statisticInstruments).toContainText(/Total Instruments/);
    await expect(dashboardPage.statisticRecords).toContainText(/Total Records/);
    await expect(dashboardPage.subjectsGrowthChart).toBeVisible();

    // The trend series are labelled in a visible legend, without requiring hover.
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

    // Each time window lines up with its chart title, near the card edge.
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

    // The dialogs show their tables as plain text, with larger bold headers in place of the borders.
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
      await expect(frame.getByTestId('data-table-head')).toHaveCSS('font-size', '18px');
      await expect(dialog.getByTestId('data-table-row').first()).toHaveCSS('font-size', '16px');
      await page.keyboard.press('Escape');
    }
  });

  // A record keeps the id of the edition it was collected with, so the records dialog once counted
  // only the latest edition's records, and the instruments card counted every edition in the database.
  // Edition 2 is stored after the group exists, so the group gains it the way an upgrade does. The
  // users dialog is read from the same group, so it lists exactly the two members seeded here.
  test("should match each card to its dialog over the group's own data, counting the records of every edition", async ({
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
    const [{ credentials }, { credentials: colleague }] = await Promise.all([
      api.createUser({ basePermissionLevel: 'GROUP_MANAGER', groupIds: [group.id] }),
      api.createUser({ groupIds: [group.id] })
    ]);
    await authenticateAs(credentials);

    const dashboardPage = new DashboardPage(page);
    await dashboardPage.goto('/dashboard');

    await expect(dashboardPage.statisticUsers.getByRole('heading')).toHaveText('2');
    await dashboardPage.statisticUsers.click();
    const userRows = dashboardPage.usersDialog.getByTestId('data-table-row');
    await expect(userRows).toHaveCount(2);
    for (const username of [credentials.username, colleague.username]) {
      await expect(userRows.filter({ hasText: username })).toHaveCount(1);
    }
    await page.keyboard.press('Escape');

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
});
