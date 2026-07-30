import type { Locator, Page } from '@playwright/test';

import { AppPage } from './route.page';

export class DashboardPage extends AppPage {
  readonly pageHeader: Locator;
  readonly recordsSessionsChart: Locator;
  readonly statisticInstruments: Locator;
  readonly statisticRecords: Locator;
  readonly statisticSubjects: Locator;
  readonly statisticUsers: Locator;
  readonly subjectsGrowthChart: Locator;
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
    this.usersDialog = page.getByTestId('dashboard-users-Modal-dialog');
  }
}
