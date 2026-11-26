import { expect } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';

import type { NavigateArgs, RouteTo } from '../support/types';

export abstract class RootPage {
  readonly $ref: Page;
  abstract readonly _requiresAuth: boolean;
  readonly inactivityWarning: Locator;

  /** Covers whichever page the user is on once their access token has run out. */
  readonly reauthenticationDialog: Locator;

  constructor(page: Page) {
    this.$ref = page;
    this.inactivityWarning = page.getByTestId('inactivity-warning');
    this.reauthenticationDialog = page.getByTestId('reauthentication-dialog');
  }

  protected getUrlWithParams<TPath extends RouteTo>(...args: NavigateArgs<TPath>) {
    let url: string = args[0];
    if (args[1]) {
      Object.entries(args[1]).forEach(([key, value]) => {
        url = url.replace(`$${key}`, String(value));
      });
    }
    return url;
  }

  async goto<TPath extends RouteTo>(...args: NavigateArgs<TPath>): Promise<void> {
    const url = this.getUrlWithParams(...args);
    await this.$ref.goto(url);
    await expect(this.$ref).toHaveURL(url);
  }

  async signInAgain(password: string): Promise<void> {
    await this.reauthenticationDialog.getByLabel('Password').fill(password);
    await this.reauthenticationDialog.getByRole('button', { name: 'Submit' }).click();
    await expect(this.reauthenticationDialog).toBeHidden();
  }
}
