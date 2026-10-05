import type { Locator, Page } from '@playwright/test';

import { AppPage } from '../../route.page';

export class InstrumentHubPage extends AppPage {
  readonly pageHeader: Locator;
  readonly rows: Locator;
  readonly searchInput: Locator;
  constructor(page: Page) {
    super(page);
    this.pageHeader = page.getByTestId('page-header');
    this.rows = page.getByTestId('data-table-body').getByTestId('data-table-row');
    this.searchInput = page.getByTestId('data-table-search-bar').getByRole('searchbox');
  }

  /** Opens an instrument's detail page through its row action, as a user would. */
  async open(title: string) {
    await this.row(title).first().getByTestId('row-actions-trigger').click();
    await this.$ref.getByRole('menuitem', { exact: true, name: 'View' }).click();
  }

  /** The row for an instrument, found by the title shown in its first column. */
  row(title: string): Locator {
    return this.rows.filter({ hasText: title });
  }

  /** Clicks a column header to cycle its sort. Removal is disabled, so this toggles asc ⇄ desc. */
  async sortBy(label: string) {
    await this.$ref.getByTestId('data-table-head').getByRole('button', { name: label }).click();
  }

  /** The visible title of every listed instrument, top to bottom — the first cell of each row. */
  async titles(): Promise<string[]> {
    const rows = await this.rows.all();
    return Promise.all(rows.map(async (row) => (await row.locator('> div').first().innerText()).trim()));
  }
}
