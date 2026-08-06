import type { Language } from '@opendatacapture/schemas/core';
import type { Locator, Page } from '@playwright/test';

import { AppPage } from '../route.page';

export class AdminSettingsPage extends AppPage {
  readonly defaultAssignmentDurationInput: Locator;
  readonly groupSwitcherPositionSelect: Locator;
  readonly pageHeader: Locator;
  readonly remoteAssignmentsToggle: Locator;
  readonly uploaderToggle: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeader = page.getByTestId('page-header');
    this.uploaderToggle = page.getByRole('switch', { name: 'Enable Uploader' });
    this.remoteAssignmentsToggle = page.getByRole('switch', { name: 'Enable Remote Assignments' });
    this.defaultAssignmentDurationInput = page.getByTestId('default-assignment-duration-input');
    this.groupSwitcherPositionSelect = page.getByRole('combobox');
  }

  activeLanguageCheckbox(language: Language): Locator {
    return this.$ref.getByTestId(`active-language-${language}`);
  }

  async setDefaultAssignmentDuration(days: number) {
    await this.defaultAssignmentDurationInput.fill(String(days));
    await this.defaultAssignmentDurationInput.press('Enter');
  }
}
