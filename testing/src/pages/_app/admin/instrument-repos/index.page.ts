import type { Locator, Page } from '@playwright/test';

import { AppPage } from '../../route.page';

export class InstrumentReposPage extends AppPage {
  readonly addRepositoryButton: Locator;
  /** Wraps whichever tab is showing; drawn invisible so the tables sit directly on the page. */
  readonly card: Locator;
  readonly clearLogButton: Locator;
  /** The repositories table, shown on the Repositories tab. */
  readonly dataTable: Locator;
  readonly githubUrlInput: Locator;
  readonly importButton: Locator;
  readonly pageHeader: Locator;
  readonly sectionTitle: Locator;
  readonly syncAllButton: Locator;
  /** The activity log, shown on its own tab in place of the repositories table. */
  readonly syncLogTable: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeader = page.getByTestId('page-header');
    this.card = page.getByTestId('instrument-repos-card');
    this.dataTable = page.getByTestId('data-table').first();
    this.sectionTitle = page.getByTestId('instrument-repos-section-title');
    this.syncLogTable = page.getByTestId('instrument-repo-sync-log');
    this.syncAllButton = page.getByRole('button', { name: 'Sync All' });
    this.clearLogButton = page.getByRole('button', { name: 'Clear Log' });
    this.addRepositoryButton = page.getByRole('button', { name: 'Add Repository' });
    this.githubUrlInput = page.getByLabel('GitHub URL');
    // A plain HTML form (not the shared `Form` component), so its accessible name is the literal label.
    this.importButton = page.getByRole('button', { name: 'Import' });
  }

  async openActivityLog(): Promise<void> {
    await this.$ref.getByTestId('instrument-repos-section-ACTIVITY').click();
  }

  /** Opens a repository row's action menu and picks one of its entries. */
  async selectRowAction(rowIndex: number, label: string): Promise<void> {
    await this.dataTable.getByTestId('row-actions-trigger').nth(rowIndex).click();
    await this.$ref.getByRole('menuitem', { name: label }).click();
  }
}
