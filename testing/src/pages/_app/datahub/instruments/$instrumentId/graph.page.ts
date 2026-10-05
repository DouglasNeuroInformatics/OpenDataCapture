import type { Locator, Page } from '@playwright/test';

import { AppPage } from '../../../route.page';

export class InstrumentHubGraphPage extends AppPage {
  readonly chart: Locator;
  readonly chartToggle: Locator;
  readonly colourByTrigger: Locator;
  readonly measureTrigger: Locator;
  constructor(page: Page) {
    super(page);
    this.chart = page.getByTestId('instrument-hub-chart');
    this.chartToggle = page.getByTestId('instrument-hub-chart-toggle');
    this.colourByTrigger = page.getByTestId('instrument-hub-colour-by-trigger');
    this.measureTrigger = page.getByTestId('instrument-hub-measure-trigger');
  }

  /** The distribution bars recharts renders, one per bin per series. */
  get bars(): Locator {
    return this.chart.locator('.recharts-bar-rectangle');
  }

  /** The scatter marks recharts renders, one per plotted record. */
  get scatterMarks(): Locator {
    return this.chart.locator('.recharts-scatter-symbol');
  }

  async selectChart(chart: 'Distribution' | 'Over Time') {
    await this.chartToggle.getByRole('tab', { name: chart }).click();
  }

  async selectColourBy(label: string) {
    await this.colourByTrigger.click();
    await this.$ref.getByRole('option', { name: label }).click();
  }

  async selectMeasure(label: string) {
    await this.measureTrigger.click();
    await this.$ref.getByRole('option', { name: label }).click();
  }
}
