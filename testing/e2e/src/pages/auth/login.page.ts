import type { $LoginCredentials } from '@opendatacapture/schemas/auth';
import type { Locator, Page } from '@playwright/test';

import { RootPage } from '../__root.page';

export class LoginPage extends RootPage {
  readonly loginForm: Locator;

  constructor(page: Page) {
    super(page);
    this.loginForm = page.getByTestId('login-form');
  }

  async fillLoginForm(credentials: $LoginCredentials) {
    await this.loginForm.getByLabel('username').fill(credentials.username);
    await this.loginForm.getByLabel('password').fill(credentials.password);
    await this.loginForm.getByLabel('Submit').click();
  }
}
