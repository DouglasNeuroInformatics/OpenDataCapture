import type { Download, Locator, Page } from '@playwright/test';

import { AppPage } from '../../route.page';

export class DatahubPage extends AppPage {
  readonly collectedPresetFilter: Locator;
  readonly exportDropdown: Locator;
  readonly filtersTrigger: Locator;
  readonly minRecordsFilter: Locator;
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
    this.minRecordsFilter = page.getByTestId('datahub-filter-min-records');
    this.collectedPresetFilter = page.getByTestId('datahub-filter-collected-preset');
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

  /**
   * Opens the filter menu and requires at least `count` records. A minimum of one is what the old
   * "with records only" checkbox meant; every value narrows on the per-subject counts already
   * loaded for the column rather than refetching.
   */
  async requireAtLeastRecords(count: number) {
    await this.openFilters();
    await this.minRecordsFilter.fill(String(count));
  }

  /** Opens the filter menu and picks a collection-date window. */
  async selectCollectedWindow(
    preset:
      'all' | 'custom' | 'pastMonth' | 'pastSixMonths' | 'pastThreeMonths' | 'pastTwoYears' | 'pastWeek' | 'pastYear'
  ) {
    await this.openFilters();
    await this.collectedPresetFilter.selectOption(preset);
  }

  private async openFilters() {
    if ((await this.filtersTrigger.getAttribute('data-state')) !== 'open') {
      await this.filtersTrigger.click();
    }
  }
}
