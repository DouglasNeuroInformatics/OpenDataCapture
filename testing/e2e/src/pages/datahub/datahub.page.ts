import type { Locator, Page } from '@playwright/test';

import { AppPage } from '../_app.page';

export class DatahubPage extends AppPage {
  readonly pageHeader: Locator;
  constructor(page: Page) {
    super(page);
    this.pageHeader = page.getByTestId('page-header');
  }
}
