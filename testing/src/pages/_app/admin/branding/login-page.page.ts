import { expect } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';

import { AppPage } from '../../route.page';

export class BrandingLoginPagePage extends AppPage {
  readonly customLogoHeightInput: Locator;
  readonly customLogoWidthInput: Locator;
  readonly enableBrandingCheckbox: Locator;
  readonly instanceNameEnglishInput: Locator;
  readonly instanceNameFrenchInput: Locator;
  readonly logoSizeSelect: Locator;
  readonly saveButton: Locator;
  readonly showLogoCheckbox: Locator;

  constructor(page: Page) {
    super(page);
    // Multiple "English" text fields exist on this page (name, tagline, details), so the label alone
    // is ambiguous; `instanceName-en` is the field's stable id in the source.
    this.instanceNameEnglishInput = page.locator('#instanceName-en');
    this.instanceNameFrenchInput = page.locator('#instanceName-fr');
    this.enableBrandingCheckbox = page.locator('#enableBranding');
    this.showLogoCheckbox = page.locator('#showLogo');
    this.logoSizeSelect = page.locator('#logoSize');
    this.customLogoWidthInput = page.getByLabel('Width', { exact: true });
    this.customLogoHeightInput = page.getByLabel('Height', { exact: true });
    this.saveButton = page.getByRole('button', { name: 'Save' });
  }

  async saveAndConfirm() {
    await this.saveButton.click();
    await expect(this.$ref.getByText('The login page has been updated.')).toBeVisible();
  }

  async selectLogoSize(label: string) {
    await this.logoSizeSelect.click();
    await this.$ref.getByRole('option', { exact: true, name: label }).click();
  }
}
