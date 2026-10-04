import type { Download, Locator, Page } from '@playwright/test';

import { AppPage } from '../route.page';

export class DatahubPage extends AppPage {
  readonly exportDropdown: Locator;
  readonly filtersTrigger: Locator;
  readonly hasRecordsFilter: Locator;
  readonly pageHeader: Locator;
  readonly rowActionsTrigger: Locator;
  readonly rows: Locator;
  readonly searchBar: Locator;
  readonly searchInput: Locator;
  readonly subjectLookupButton: Locator;
  constructor(page: Page) {
    super(page);
    this.exportDropdown = page.getByTestId('datahub-export-dropdown');
    this.filtersTrigger = page.getByTestId('datahub-filters-trigger');
    this.hasRecordsFilter = page.getByTestId('datahub-filter-has-records');
    this.pageHeader = page.getByTestId('page-header');
    this.rowActionsTrigger = page.getByTestId('row-actions-trigger').first();
    this.rows = page.getByTestId('data-table-body').getByTestId('data-table-row');
    this.searchBar = page.getByTestId('data-table-search-bar');
    this.searchInput = this.searchBar.getByRole('searchbox');
    this.subjectLookupButton = page.getByTestId('subject-lookup-search-button');
  }

  /**
   * Picks a format from the export menu and returns the file it produced. Matched by extension,
   * because a CSV export downloads a `README.txt` before the `.csv` itself.
   */
  async exportAs(format: 'CSV' | 'Excel' | 'JSON'): Promise<Download> {
    const extension = { CSV: '.csv', Excel: '.xlsx', JSON: '.json' }[format];
    const started = this.$ref.waitForEvent('download', (download) => download.suggestedFilename().endsWith(extension));
    await this.exportDropdown.click();
    await this.$ref.getByRole('menuitem', { exact: true, name: format }).click();
    return started;
  }

  /** Opens the filter menu and toggles "With records only", which refetches with `hasRecord=true`. */
  async toggleWithRecordsOnly() {
    await this.filtersTrigger.click();
    await this.hasRecordsFilter.click();
  }
}
