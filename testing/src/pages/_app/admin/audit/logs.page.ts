import type { Locator, Page } from '@playwright/test';

import { AppPage } from '../../route.page';

export class AuditLogsPage extends AppPage {
  readonly dataTable: Locator;
  readonly downloadButton: Locator;
  readonly filtersButton: Locator;
  readonly pageHeader: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeader = page.getByTestId('page-header');
    this.dataTable = page.getByTestId('data-table');
    this.filtersButton = page.getByRole('button', { name: 'Filters' });
    this.downloadButton = page.getByRole('button', { name: 'Download' });
  }

  /**
   * Opens the Filters dropdown and checks a single option. Selecting a filter changes the search
   * params, which remounts the table (and this dropdown along with it) to reset pagination -- so only
   * one option can be checked per call. Call this again (it reopens the menu) to add another filter.
   */
  async filterBy(optionLabel: string) {
    await this.filtersButton.click();
    await this.$ref.getByRole('menuitemcheckbox', { exact: true, name: optionLabel }).click();
  }
}
