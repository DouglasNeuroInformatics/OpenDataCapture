import type { Download, Locator, Page } from '@playwright/test';

import { AppPage } from '../../../route.page';

export class InstrumentHubTablePage extends AppPage {
  readonly collectionMethodCells: Locator;
  readonly exportDropdown: Locator;
  readonly filtersTrigger: Locator;
  readonly pageHeader: Locator;
  readonly rows: Locator;
  readonly seriesCells: Locator;
  readonly table: Locator;
  constructor(page: Page) {
    super(page);
    this.exportDropdown = page.getByTestId('instrument-hub-export-dropdown');
    this.filtersTrigger = page.getByTestId('instrument-hub-filters-trigger');
    this.pageHeader = page.getByTestId('page-header');
    this.table = page.getByTestId('instrument-hub-records-table');
    this.rows = this.table.getByTestId('data-table-body').getByTestId('data-table-row');
    this.collectionMethodCells = this.table.getByTestId('record-cell-collection-method');
    this.seriesCells = this.table.getByTestId('record-cell-series');
  }

  /** Unchecks one collection method in the filter menu, narrowing both tabs and the export. */
  async excludeCollectionMethod(method: 'IN_PERSON' | 'REMOTE' | 'RETROSPECTIVE') {
    await this.filtersTrigger.click();
    await this.$ref.getByTestId(`instrument-hub-filter-method-${method}`).click();
    await this.$ref.keyboard.press('Escape');
  }

  /** Picks a format from the download menu and returns the file it produced. */
  async exportAs(format: 'CSV' | 'CSV Long' | 'Excel' | 'JSON' | 'TSV'): Promise<Download> {
    const extension = { CSV: '.csv', 'CSV Long': '.csv', Excel: '.xlsx', JSON: '.json', TSV: '.tsv' }[format];
    const started = this.$ref.waitForEvent('download', (download) => download.suggestedFilename().endsWith(extension));
    await this.exportDropdown.click();
    await this.$ref.getByRole('menuitem', { exact: true, name: format }).click();
    return started;
  }
}
