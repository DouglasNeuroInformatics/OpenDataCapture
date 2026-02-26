import type { Locator, Page } from '@playwright/test';

import { AppPage } from '../_app.page';

export class DatahubPage extends AppPage {
  readonly pageHeader: Locator;
  readonly rowActionsTrigger: Locator;
  constructor(page: Page) {
    super(page);
    this.pageHeader = page.getByTestId('page-header');
    this.rowActionsTrigger = page.getByTestId('row-actions-trigger').first();
  }
}
