import type { Locator, Page } from '@playwright/test';

import { AppPage } from './_app.page';

export class StartSessionPage extends AppPage {
  readonly pageHeader: Locator;
  readonly subjectIdentificationInput: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeader = page.getByTestId('page-header');
    this.subjectIdentificationInput = page.getByRole('textbox', { name: 'subjectFirstName' });
  }
}
