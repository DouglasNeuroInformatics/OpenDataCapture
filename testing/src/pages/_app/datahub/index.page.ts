import type { Download, Locator, Page } from '@playwright/test';

import { AppPage } from '../route.page';

export class DatahubPage extends AppPage {
  readonly exportDropdown: Locator;
  readonly pageHeader: Locator;
  readonly rowActionsTrigger: Locator;
  readonly rows: Locator;
  readonly searchInput: Locator;
  constructor(page: Page) {
    super(page);
    this.exportDropdown = page.getByTestId('datahub-export-dropdown');
    this.pageHeader = page.getByTestId('page-header');
    this.rowActionsTrigger = page.getByTestId('row-actions-trigger').first();
    this.rows = page.getByTestId('data-table-body').getByTestId('data-table-row');
    this.searchInput = page.getByTestId('data-table-search-bar').getByRole('searchbox');
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
}
