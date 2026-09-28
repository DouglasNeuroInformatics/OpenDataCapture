import type { $LoginCredentials } from '@opendatacapture/schemas/auth';
import { expect } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';

import { RootPage } from '../__root.page';

export class LoginPage extends RootPage {
  readonly _requiresAuth = false;
  readonly demoDialog: Locator;
  readonly loginForm: Locator;

  constructor(page: Page) {
    super(page);
    this.demoDialog = page.getByTestId('demo-dialog');
    this.loginForm = page.getByTestId('login-form');
  }

  async dismissDemoDialog() {
    await this.$ref.keyboard.press('Escape');
    await expect(this.demoDialog).toBeHidden();
  }

  async fillLoginForm(credentials: $LoginCredentials) {
    // The suite's instance is a demo, whose dialog opens over the form in the same render and
    // swallows every click until dismissed.
    await this.loginForm.waitFor();
    if (await this.demoDialog.isVisible()) {
      await this.dismissDemoDialog();
    }
    await this.loginForm.getByLabel('username').fill(credentials.username);
    await this.loginForm.getByLabel('password').fill(credentials.password);
    await this.loginForm.getByLabel('Submit').click();
  }
}
