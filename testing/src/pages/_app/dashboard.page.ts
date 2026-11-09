import { expect } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';

import { AppPage } from './route.page';

export class DashboardPage extends AppPage {
  readonly instrumentsDialog: Locator;
  readonly pageHeader: Locator;
  readonly recordsDialog: Locator;
  readonly recordsSessionsChart: Locator;
  readonly recordsTrendWindow: Locator;
  readonly statisticInstruments: Locator;
  readonly statisticRecords: Locator;
  readonly statisticSubjects: Locator;
  readonly statisticUsers: Locator;
  readonly subjectsGrowthChart: Locator;
  readonly subjectsTrendWindow: Locator;
  readonly usersDialog: Locator;
  readonly welcomeHeading: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeader = page.getByTestId('page-header');
    this.welcomeHeading = page.getByTestId('dashboard-welcome-heading');
    this.statisticUsers = page.getByTestId('statistic-users');
    this.statisticSubjects = page.getByTestId('statistic-subjects');
    this.statisticInstruments = page.getByTestId('statistic-instruments');
    this.statisticRecords = page.getByTestId('statistic-records');
    this.recordsSessionsChart = page.getByTestId('dashboard-chart-records-sessions');
    this.subjectsGrowthChart = page.getByTestId('dashboard-chart-subjects-growth');
    this.recordsTrendWindow = page.getByTestId('dashboard-records-trend-window');
    this.subjectsTrendWindow = page.getByTestId('dashboard-subjects-trend-window');
    this.usersDialog = page.getByTestId('dashboard-users-Modal-dialog');
    this.instrumentsDialog = page.getByTestId('dashboard-instruments-Modal-dialog');
    this.recordsDialog = page.getByTestId('dashboard-record-Modal-dialog');
  }

  /** Every row of a dialog's paginated table, counted by stepping through its pages. */
  async countDialogRows(dialog: Locator): Promise<number> {
    const rows = dialog.getByTestId('data-table-row');
    const nextButton = dialog.locator('button:has(svg.lucide-chevron-right)');
    await rows.first().waitFor();
    let count = await rows.count();
    while (await nextButton.isEnabled()) {
      const firstRow = await rows.first().textContent();
      await nextButton.click();
      await expect(rows.first()).not.toHaveText(firstRow!);
      count += await rows.count();
    }
    return count;
  }
}
