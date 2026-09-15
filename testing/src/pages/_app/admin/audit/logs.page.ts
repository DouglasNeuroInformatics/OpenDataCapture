import type { Locator, Page } from '@playwright/test';

import { AppPage } from '../../route.page';

export type AuditLogsFilter = 'action' | 'entity' | 'group' | 'user';

export class AuditLogsPage extends AppPage {
  readonly clearFiltersButton: Locator;
  readonly dataTable: Locator;
  readonly downloadButton: Locator;
  readonly pageHeader: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeader = page.getByTestId('page-header');
    this.dataTable = page.getByTestId('data-table');
    this.clearFiltersButton = page.getByTestId('audit-logs-clear-filters');
    this.downloadButton = page.getByRole('button', { name: 'Download' });
  }

  filterButton(filter: AuditLogsFilter) {
    return this.$ref.getByTestId(`audit-logs-filter-${filter}`);
  }

  /** Opens one filter's menu and picks an option; the menu closes itself once the option is chosen. */
  async filterBy(filter: AuditLogsFilter, optionLabel: string) {
    await this.filterButton(filter).click();
    await this.$ref.getByRole('menuitemradio', { exact: true, name: optionLabel }).click();
  }
}
