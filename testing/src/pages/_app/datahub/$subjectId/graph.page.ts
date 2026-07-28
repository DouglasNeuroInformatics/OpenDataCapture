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
   * The dots plotted for one measure. Each selected measure also gets a dashed group-trend line
   * whose points carry the same `.recharts-line-dot` class and appear only once the linear-model
   * query resolves, so an unscoped locator matches one or two elements depending on timing.
   */
  measureDots(label: string): Locator {
    return this.chart.locator(`.recharts-line-dot[name="${label}"]`);
  }

  /**
   * The instrument list is a fresh fetch on every mount, but has rarely (not reliably reproducible)
   * still been missing an instrument completed moments earlier -- an apparent eventual-consistency
   * gap somewhere between the write and this read, not a caching issue in the client. The option
   * has also been seen detaching mid-click as the list re-renders under it. Both failures look the
   * same from here, and a reload is what's actually been observed to help, so retry through one.
   */
  async selectInstrument(title: string, attempts = 3) {
    for (let attempt = 1; attempt <= attempts; attempt++) {
      await this.instrumentSelectTrigger.click();
      const option = this.$ref.getByRole('option', { name: title });
      const selected = await option
        .click({ timeout: attempt === attempts ? 15000 : 5000 })
        .then(() => true)
        .catch(() => false);
      if (selected) {
        return;
      }
      if (attempt < attempts) {
        await this.$ref.keyboard.press('Escape');
        await this.$ref.reload();
      }
    }
    throw new Error(`Instrument "${title}" was never selectable in the graph tab after ${attempts} attempts.`);
  }

  async selectMeasure(label: string) {
    await this.measuresButton.click();
    await this.$ref.getByRole('menuitemcheckbox', { name: label }).click();
    await this.$ref.keyboard.press('Escape');
  }
}
