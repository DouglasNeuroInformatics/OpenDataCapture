import { expect } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';

import { AppPage } from '../../route.page';

export class BrandingLoginPagePage extends AppPage {
  readonly enableBrandingCheckbox: Locator;
  readonly instanceNameEnglishInput: Locator;
  readonly instanceNameFrenchInput: Locator;
  readonly saveButton: Locator;

  constructor(page: Page) {
    super(page);
    // Multiple "English" text fields exist on this page (name, tagline, details), so the label alone
    // is ambiguous; `instanceName-en` is the field's stable id in the source.
    this.instanceNameEnglishInput = page.locator('#instanceName-en');
    this.instanceNameFrenchInput = page.locator('#instanceName-fr');
    this.enableBrandingCheckbox = page.locator('#enableBranding');
    this.saveButton = page.getByRole('button', { name: 'Save' });
  }

  async saveAndConfirm() {
    await this.saveButton.click();
    await expect(this.$ref.getByText('The login page has been updated.')).toBeVisible();
  }
}
