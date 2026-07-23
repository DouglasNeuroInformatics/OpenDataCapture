import type { Locator, Page } from '@playwright/test';

import { AppPage } from '../route.page';

export class AccessibleInstrumentsPage extends AppPage {
  readonly instrumentShowcase: Locator;
  readonly pageHeader: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeader = page.getByTestId('page-header');
    this.instrumentShowcase = page.getByTestId('instrument-showcase');
  }

  /** Cards carry a content-hash testid, so match on the visible title instead. */
  instrumentCard(title: string): Locator {
    return this.instrumentShowcase.locator('[data-testid^="instrument-card-"]').filter({ hasText: title }).first();
  }

  async openInstrument(title: string): Promise<void> {
    const card = this.instrumentCard(title);
    await card.waitFor({ state: 'visible' });
    await card.click();
  }
}
