import type { Locator, Page } from '@playwright/test';

import { RootPage } from './__root.page';

export abstract class AppPage extends RootPage {
  readonly sidebar: Locator;

  constructor(page: Page) {
    super(page);
    this.sidebar = page.getByTestId('sidebar');
  }
}
