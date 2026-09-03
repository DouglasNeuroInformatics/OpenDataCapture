import type { Locator, Page } from '@playwright/test';

import { RootPage } from '../__root.page';

export class ResetPasswordPage extends RootPage {
  readonly _requiresAuth = false;
  readonly resetForm: Locator;
  readonly signInButton: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.resetForm = page.getByTestId('reset-password-form');
    this.successMessage = page.getByTestId('reset-password-success');
    this.signInButton = this.successMessage.getByRole('button');
  }

  async fillResetForm(password: string) {
    await this.resetForm.getByLabel('Password', { exact: true }).fill(password);
    await this.resetForm.getByLabel('Confirm Password').fill(password);
    await this.resetForm.getByLabel('Submit').click();
  }
}
