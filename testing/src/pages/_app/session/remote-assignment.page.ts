import type { Locator, Page } from '@playwright/test';

import { AppPage } from '../route.page';

export class RemoteAssignmentPage extends AppPage {
  readonly closeResultButton: Locator;
  readonly copyLinkButton: Locator;
  readonly createDialog: Locator;
  readonly instrumentShowcase: Locator;
  readonly pageHeader: Locator;
  readonly qrCode: Locator;
  readonly urlInput: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeader = page.getByTestId('page-header');
    this.instrumentShowcase = page.getByTestId('instrument-showcase');
    this.createDialog = page.getByRole('dialog');
    this.urlInput = page.locator('input[readonly]');
    // The copy-to-clipboard button carries no accessible name or testid; it is the only button
    // rendered immediately next to the readonly URL input.
    this.copyLinkButton = page.locator('input[readonly] + button');
    this.qrCode = page.locator('canvas');
    // The result panel's own X icon shares the same accessible name, so scope to the footer button.
    this.closeResultButton = page.getByRole('button', { name: 'Close' }).first();
  }

  async clickFirstInstrumentCard() {
    const firstCard = this.instrumentShowcase.locator('li').first();
    await firstCard.waitFor({ state: 'visible' });
    await firstCard.click();
  }

  /** Cards carry a content-hash testid, so match on the visible title instead. */
  instrumentCard(title: string): Locator {
    return this.instrumentShowcase.locator('[data-testid^="instrument-card-"]').filter({ hasText: title }).first();
  }

  async selectInstrument(title: string) {
    const card = this.instrumentCard(title);
    await card.waitFor({ state: 'visible' });
    await card.click();
  }

  async submitAssignmentForm() {
    const submitButton = this.createDialog.getByLabel('Submit');
    await submitButton.waitFor({ state: 'visible' });
    await submitButton.click();
  }
}
