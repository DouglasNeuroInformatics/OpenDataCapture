import type { Locator, Page } from '@playwright/test';

import { AppPage } from '../route.page';

export class DatahubPage extends AppPage {
  readonly filtersTrigger: Locator;
  readonly hasRecordsFilter: Locator;
  readonly pageHeader: Locator;
  readonly rowActionsTrigger: Locator;
  readonly rows: Locator;
  constructor(page: Page) {
    super(page);
    this.filtersTrigger = page.getByTestId('datahub-filters-trigger');
    this.hasRecordsFilter = page.getByTestId('datahub-filter-has-records');
    this.pageHeader = page.getByTestId('page-header');
    this.rowActionsTrigger = page.getByTestId('row-actions-trigger').first();
    this.rows = page.getByTestId('data-table-body').getByTestId('data-table-row');
  }

  /** Opens the filter menu and toggles "With records only", which refetches with `hasRecord=true`. */
  async toggleWithRecordsOnly() {
    await this.filtersTrigger.click();
    await this.hasRecordsFilter.click();
  }
}
