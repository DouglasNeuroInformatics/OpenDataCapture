import type { Locator, Page } from '@playwright/test';

import { AppPage } from './route.page';

export class UserAccountPage extends AppPage {
  readonly changePasswordButton: Locator;
  readonly emailInput: Locator;
  readonly pageHeader: Locator;
  readonly passwordDialog: Locator;
  readonly phoneNumberInput: Locator;
  readonly profileForm: Locator;

  constructor(page: Page) {
    super(page);
    this.changePasswordButton = page.getByRole('button', { name: 'Change Password' });
    this.pageHeader = page.getByTestId('page-header');
    this.passwordDialog = page.getByRole('dialog', { name: 'Change Password' });
    this.profileForm = page.getByTestId('profile-form');
    this.emailInput = this.profileForm.getByLabel('Email');
    this.phoneNumberInput = this.profileForm.getByLabel('Phone Number');
  }

  async openPasswordDialog(): Promise<void> {
    await this.changePasswordButton.click();
  }

  async saveProfile(): Promise<void> {
    await this.profileForm.getByRole('button', { name: 'Submit' }).click();
  }

  async submitNewPassword(password: string): Promise<void> {
    await this.passwordDialog.getByLabel('Password', { exact: true }).fill(password);
    await this.passwordDialog.getByLabel('Confirm Password').fill(password);
    await this.passwordDialog.getByRole('button', { name: 'Submit' }).click();
  }
}
