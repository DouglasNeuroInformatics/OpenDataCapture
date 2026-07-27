import type { Locator, Page } from '@playwright/test';

import { AppPage } from '../../route.page';

export class BrandingPage extends AppPage {
  readonly loginPageLink: Locator;
  readonly pageHeader: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeader = page.getByTestId('page-header');
    this.loginPageLink = page.getByRole('link', { name: 'Login Page' });
  }
}
