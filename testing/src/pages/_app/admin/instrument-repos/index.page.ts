import type { Locator, Page } from '@playwright/test';

import { AppPage } from '../../route.page';

export class InstrumentReposPage extends AppPage {
  readonly addRepositoryButton: Locator;
  readonly dataTable: Locator;
  readonly githubUrlInput: Locator;
  readonly importButton: Locator;
  readonly pageHeader: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeader = page.getByTestId('page-header');
    this.dataTable = page.getByTestId('data-table');
    this.addRepositoryButton = page.getByRole('button', { name: 'Add Repository' });
    this.githubUrlInput = page.getByLabel('GitHub URL');
    // A plain HTML form (not the shared `Form` component), so its accessible name is the literal label.
    this.importButton = page.getByRole('button', { name: 'Import' });
  }
}
