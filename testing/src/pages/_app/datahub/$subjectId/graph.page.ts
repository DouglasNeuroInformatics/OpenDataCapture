import type { Locator, Page } from '@playwright/test';

import { AppPage } from '../../route.page';

export class SubjectGraphPage extends AppPage {
  readonly chart: Locator;
  readonly instrumentSelectTrigger: Locator;
  readonly measuresButton: Locator;

  constructor(page: Page) {
    super(page);
    this.instrumentSelectTrigger = page.getByTestId('select-instrument-dropdown-trigger');
    this.measuresButton = page.getByRole('button', { name: 'Measures' });
    this.chart = page.getByTestId('subject-graph-chart');
  }

  /**
   * The instrument list is a fresh fetch on every mount, but has rarely (not reliably reproducible)
   * still been missing an instrument completed moments earlier -- an apparent eventual-consistency
   * gap somewhere between the write and this read, not a caching issue in the client. Retry with a
   * reload rather than a single long wait, since a reload is what's actually been observed to help.
   */
  async selectInstrument(title: string, attempts = 3) {
    for (let attempt = 1; attempt <= attempts; attempt++) {
      await this.instrumentSelectTrigger.click();
      const option = this.$ref.getByRole('option', { name: title });
      const found = await option
        .waitFor({ state: 'visible', timeout: attempt === attempts ? 15000 : 5000 })
        .then(() => true)
        .catch(() => false);
      if (found) {
        await option.click();
        return;
      }
      if (attempt < attempts) {
        await this.$ref.keyboard.press('Escape');
        await this.$ref.reload();
      }
    }
    throw new Error(`Instrument "${title}" never appeared in the graph tab's selector after ${attempts} attempts.`);
  }

  async selectMeasure(label: string) {
    await this.measuresButton.click();
    await this.$ref.getByRole('menuitemcheckbox', { name: label }).click();
    await this.$ref.keyboard.press('Escape');
  }
}
