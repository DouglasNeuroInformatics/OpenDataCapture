import type { Locator, Page } from '@playwright/test';

import { AppPage } from '../route.page';

export class AdminSettingsPage extends AppPage {
  readonly groupSwitcherPositionSelect: Locator;
  readonly pageHeader: Locator;
  readonly saveButton: Locator;
  readonly uploaderToggle: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeader = page.getByTestId('page-header');
    this.uploaderToggle = page.getByRole('switch', { name: 'Enable Uploader' });
    this.saveButton = page.getByRole('button', { name: 'Save' });
    this.groupSwitcherPositionSelect = page.getByRole('combobox');
  }
}
