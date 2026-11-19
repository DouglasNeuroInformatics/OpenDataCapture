import type { Locator, Page } from '@playwright/test';

import { AppPage } from '../../route.page';

export class InstrumentReposPage extends AppPage {
  readonly addRepositoryButton: Locator;
  /** Wraps whichever tab is showing; drawn invisible so the tables sit directly on the page. */
  readonly card: Locator;
  /** The repositories table, shown on the Repositories tab. */
  readonly dataTable: Locator;
  readonly pageHeader: Locator;
  /** The activity log, shown on its own tab in place of the repositories table. */
  readonly syncLogTable: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeader = page.getByTestId('page-header');
    this.card = page.getByTestId('instrument-repos-card');
    this.dataTable = page.getByTestId('data-table').first();
    this.syncLogTable = page.getByTestId('instrument-repo-sync-log');
    this.addRepositoryButton = page.getByRole('button', { name: 'Add Repository' });
    // A plain HTML form (not the shared `Form` component), so its accessible name is the literal label.
  }

  async openActivityLog(): Promise<void> {
    await this.$ref.getByTestId('instrument-repos-section-ACTIVITY').click();
  }
}
