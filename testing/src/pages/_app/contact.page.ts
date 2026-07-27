/* eslint-disable @typescript-eslint/consistent-type-definitions -- global augmentation requires `interface` */

import type { Locator, Page } from '@playwright/test';

import { AppPage } from './route.page';

declare global {
  interface Window {
    // Set by `captureMailtoLink` so a mailto submission can be asserted on directly instead of
    // depending on an OS mail client, which headless browsers have none of.
    __capturedMailto?: string;
  }
}

export class ContactPage extends AppPage {
  readonly messageField: Locator;
  readonly pageHeader: Locator;
  readonly reasonField: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeader = page.getByTestId('page-header');
    this.reasonField = page.getByRole('combobox');
    this.messageField = page.getByLabel('Message');
    this.submitButton = page.getByRole('button', { name: 'Submit' });
  }

  /** Stubs `window.open` to capture the mailto link a submission opens, rather than trigger it. */
  async captureMailtoLink(): Promise<void> {
    await this.$ref.evaluate(() => {
      window.__capturedMailto = undefined;
      window.open = (url) => {
        window.__capturedMailto = url?.toString();
        return null;
      };
    });
  }

  async getCapturedMailtoLink(): Promise<string | undefined> {
    return this.$ref.evaluate(() => window.__capturedMailto);
  }

  async selectReason(reason: string): Promise<void> {
    await this.reasonField.click();
    await this.$ref.getByRole('option', { name: reason }).click();
  }
}
