import type { Language } from '@opendatacapture/schemas/core';
import type { Locator, Page } from '@playwright/test';

import { AppPage } from '../route.page';

export class AdminSettingsPage extends AppPage {
  readonly defaultAssignmentDurationInput: Locator;
  readonly groupSwitcherPositionSelect: Locator;
  readonly pageHeader: Locator;
  readonly uploaderToggle: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeader = page.getByTestId('page-header');
    this.uploaderToggle = page.getByRole('switch', { name: 'Enable Uploader' });
    this.defaultAssignmentDurationInput = page.getByTestId('default-assignment-duration-input');
    this.groupSwitcherPositionSelect = page.getByRole('combobox');
  }

  activeLanguageCheckbox(language: Language): Locator {
    return this.$ref.getByTestId(`active-language-${language}`);
  }

  /** `name` is the language's autonym, which is how the toggle labels its options. */
  async selectLanguage(name: string) {
    await this.sidebar.getByTestId('language-toggle').getByRole('button').click();
    await this.$ref.getByRole('menuitem', { name }).click();
  }

  async setDefaultAssignmentDuration(days: number) {
    await this.defaultAssignmentDurationInput.fill(String(days));
    await this.defaultAssignmentDurationInput.press('Enter');
  }
}
