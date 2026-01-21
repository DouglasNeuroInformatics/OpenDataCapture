import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';

import type { NavigateArgs, RouteTo } from '../helpers/types';

export abstract class RootPage {
  readonly $ref: Page;

  constructor(page: Page) {
    this.$ref = page;
  }

  get expect() {
    return expect(this.$ref);
  }

  protected getUrlWithParams<TPath extends RouteTo>(...args: NavigateArgs<TPath>) {
    let url: string = args[0];
    if (args[1]) {
      Object.entries(args[1]).forEach(([key, value]) => {
        url = url.replace('$' + key, String(value));
      });
    }
    return url;
  }

  async goto<TPath extends RouteTo>(...args: NavigateArgs<TPath>): Promise<void> {
    await this.$ref.goto(this.getUrlWithParams(...args));
  }
}
