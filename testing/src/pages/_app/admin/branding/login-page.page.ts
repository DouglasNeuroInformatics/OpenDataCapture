import type { Locator, Page } from '@playwright/test';

import { AppPage } from '../../route.page';

export class BrandingLoginPagePage extends AppPage {
  readonly instanceNameEnglishInput: Locator;
  readonly saveButton: Locator;

  constructor(page: Page) {
    super(page);
    // Multiple "English" text fields exist on this page (name, tagline, details), so the label alone
    // is ambiguous; `instanceName-en` is the field's stable id in the source.
    this.instanceNameEnglishInput = page.locator('#instanceName-en');
    this.saveButton = page.getByRole('button', { name: 'Save' });
  }
}
