import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';

export abstract class RootPage {
  protected readonly $ref: Page;

  constructor(page: Page) {
    this.$ref = page;
  }

  get expect() {
    return expect(this.$ref);
  }
}
