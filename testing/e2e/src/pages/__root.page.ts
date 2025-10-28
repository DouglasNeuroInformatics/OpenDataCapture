import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';

export abstract class RootPage {
  protected readonly $ref: Page;
  protected abstract readonly defaultUrl: string;

  constructor(page: Page) {
    this.$ref = page;
  }

  get expect() {
    return expect(this.$ref);
  }

  async goto() {
    await this.$ref.goto(this.defaultUrl);
    await this.$ref.waitForURL(this.defaultUrl);
  }
}
