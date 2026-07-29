import type { Locator, Page } from '@playwright/test';

import { AppPage } from './route.page';

export class UserPage extends AppPage {
  readonly changePasswordButton: Locator;
  readonly emailField: Locator;
  readonly pageHeader: Locator;
  readonly passwordDialog: Locator;
  readonly phoneNumberField: Locator;
  readonly profileForm: Locator;
  readonly role: Locator;
  readonly username: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeader = page.getByTestId('page-header');
    this.username = page.getByTestId('user-info-username');
    this.role = page.getByTestId('user-info-role');
    this.changePasswordButton = page.getByRole('button', { name: 'Change Password' });
    this.passwordDialog = page.getByRole('dialog', { name: 'Change Password' });
    this.profileForm = page.getByTestId('profile-form');
    this.emailField = this.profileForm.getByLabel('Email');
    this.phoneNumberField = this.profileForm.getByLabel('Phone Number');
  }

  async openPasswordDialog(): Promise<void> {
    await this.changePasswordButton.click();
  }

  async saveProfile(): Promise<void> {
    await this.profileForm.getByRole('button', { name: 'Submit' }).click();
  }

  async submitNewPassword(password: string, confirmPassword: string = password): Promise<void> {
    await this.passwordDialog.getByLabel('Password', { exact: true }).fill(password);
    await this.passwordDialog.getByLabel('Confirm Password').fill(confirmPassword);
    await this.passwordDialog.getByRole('button', { name: 'Submit' }).click();
  }
}
