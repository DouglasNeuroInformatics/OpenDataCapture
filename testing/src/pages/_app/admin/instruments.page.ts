import type { Locator, Page } from '@playwright/test';

import { AppPage } from '../route.page';

export class AdminInstrumentsPage extends AppPage {
  readonly archiveDialog: Locator;
  readonly confirmArchive: Locator;
  readonly searchBar: Locator;

  constructor(page: Page) {
    super(page);
    this.archiveDialog = page.getByTestId('archive-series-dialog');
    this.confirmArchive = page.getByTestId('confirm-archive-series');
    this.searchBar = page.getByTestId('data-table-search-bar').locator('input');
  }

  /** Picks a row action (`Preview`, `Archive`, `Unarchive`) from the menu of the row with this title. */
  async chooseRowAction(title: string, action: string): Promise<void> {
    await this.row(title).getByTestId('row-actions-trigger').click();
    await this.$ref.getByRole('menuitem', { name: action }).click();
  }

  /** Switches to the series view; its nav button shares the forms view's URL and so its test id. */
  async openSeriesView(): Promise<void> {
    await this.$ref.goto('/admin/instruments?view=series');
  }

  /**
   * A row of the active tab's table, found by the exact title of one of its cells, each of which carries
   * its full text as a tooltip; the table has no per-row test id of its own.
   */
  row(title: string): Locator {
    return this.$ref.getByTestId('data-table-row').filter({ has: this.$ref.getByTitle(title, { exact: true }) });
  }

  /** A series' status; it carries `data-archived="true"` once the series is archived. */
  seriesStatus(title: string): Locator {
    return this.row(title).getByTestId('series-status');
  }
}
