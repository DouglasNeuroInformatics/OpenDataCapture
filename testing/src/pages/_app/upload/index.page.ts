import type { Locator, Page } from '@playwright/test';

import { AppPage } from '../route.page';

export class UploadPage extends AppPage {
  readonly pageHeader: Locator;
  readonly searchInput: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeader = page.getByTestId('page-header');
    this.searchInput = page.getByPlaceholder('Search by Instrument Title');
  }

  /**
   * Filters the instrument list down to `title` and clicks the matching row. Matches the cell text
   * exactly, since the list also contains other titles that share `title` as a substring (e.g. "Happiness
   * Questionnaire" and "Happiness Questionnaire (With General Consent)").
   */
  async selectInstrument(title: string) {
    await this.searchInput.fill(title);
    await this.$ref.getByRole('cell', { exact: true, name: title }).click();
  }
}
