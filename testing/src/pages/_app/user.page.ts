import type { Locator, Page } from '@playwright/test';

import { AppPage } from './route.page';

export class UserPage extends AppPage {
  readonly confirmPasswordField: Locator;
  readonly emailField: Locator;
  readonly errorMessage: Locator;
  readonly firstNameField: Locator;
  readonly fullName: Locator;
  readonly lastNameField: Locator;
  readonly pageHeader: Locator;
  readonly passwordField: Locator;
  readonly phoneNumberField: Locator;
  readonly role: Locator;
  readonly submitButton: Locator;
  readonly userInfoForm: Locator;
  readonly username: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeader = page.getByTestId('page-header');
    this.fullName = page.getByTestId('user-info-full-name');
    this.username = page.getByTestId('user-info-username');
    this.role = page.getByTestId('user-info-role');
    this.userInfoForm = page.getByTestId('user-info-form');
    this.emailField = this.userInfoForm.getByLabel('Email');
    this.phoneNumberField = this.userInfoForm.getByLabel('Phone Number');
    this.passwordField = this.userInfoForm.getByLabel('Password', { exact: true });
    this.confirmPasswordField = this.userInfoForm.getByLabel('Confirm Password');
    this.firstNameField = this.userInfoForm.getByLabel('First Name');
    this.lastNameField = this.userInfoForm.getByLabel('Last Name');
    this.submitButton = this.userInfoForm.getByLabel('Submit');
    this.errorMessage = page.getByTestId('error-message-text');
  }

  async changePassword(password: string, confirmPassword: string = password): Promise<void> {
    await this.passwordField.fill(password);
    await this.confirmPasswordField.fill(confirmPassword);
    await this.submitButton.click();
  }
}
