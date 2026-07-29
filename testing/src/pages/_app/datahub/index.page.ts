import type { Locator, Page } from '@playwright/test';

import { AppPage } from '../route.page';

export class DatahubPage extends AppPage {
  readonly pageHeader: Locator;
  readonly rowActionsTrigger: Locator;
  readonly searchInput: Locator;
  constructor(page: Page) {
    super(page);
    this.pageHeader = page.getByTestId('page-header');
    this.rowActionsTrigger = page.getByTestId('row-actions-trigger').first();
    this.searchInput = page.getByTestId('data-table-search-bar').getByRole('searchbox');
  }
}
