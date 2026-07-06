import type { Locator, Page } from '@playwright/test';

import { AppPage } from './_app.page';

export class RemoteAssignmentPage extends AppPage {
  readonly createDialog: Locator;
  readonly instrumentShowcase: Locator;
  readonly pageHeader: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeader = page.getByTestId('page-header');
    this.instrumentShowcase = page.getByTestId('instrument-showcase');
    this.createDialog = page.getByRole('dialog');
  }

  async clickFirstInstrumentCard() {
    const firstCard = this.instrumentShowcase.locator('li').first();
    await firstCard.waitFor({ state: 'visible' });
    await firstCard.click();
  }

  async submitAssignmentForm() {
    const submitButton = this.createDialog.getByLabel('Submit');
    await submitButton.waitFor({ state: 'visible' });
    await submitButton.click();
  }
}
