/* eslint-disable @typescript-eslint/no-empty-object-type */

import { test as base, expect } from '@playwright/test';

import { SetupPage } from '../pages/setup.page';

type TestArgs = {
  setupPage: SetupPage;
};

export const test = base.extend<TestArgs, {}>({
  setupPage: async ({ page }, use) => {
    const setupPage = new SetupPage(page);
    await setupPage.goto();
    return use(setupPage);
  }
});

export { expect };
