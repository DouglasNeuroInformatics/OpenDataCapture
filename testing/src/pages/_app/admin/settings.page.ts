import type { Locator, Page } from '@playwright/test';

import { AppPage } from '../route.page';

export class SettingsPage extends AppPage {
  readonly defaultAssignmentDurationInput: Locator;
  readonly pageHeader: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeader = page.getByTestId('page-header');
    this.defaultAssignmentDurationInput = page.getByTestId('default-assignment-duration-input');
  }

  async setDefaultAssignmentDuration(days: number) {
    await this.defaultAssignmentDurationInput.fill(String(days));
    await this.defaultAssignmentDurationInput.press('Enter');
  }
}
