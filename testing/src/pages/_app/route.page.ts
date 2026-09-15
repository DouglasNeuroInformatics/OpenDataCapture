import { expect } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';

import { RootPage } from '../__root.page';

export abstract class AppPage extends RootPage {
  readonly _requiresAuth = true;
  readonly sidebar: Locator;

  constructor(page: Page) {
    super(page);
    this.sidebar = page.getByTestId('sidebar');
  }

  /**
   * Waits for the sidebar group to render before reading its state: a one-shot `isVisible()` races
   * the setup-state query, and clicking an already-open group would collapse it.
   */
  async expandNavGroup(label: string) {
    const groupButton = this.sidebar.getByRole('button', { name: label });
    await expect(groupButton).toBeVisible();
    if ((await groupButton.getAttribute('aria-expanded')) !== 'true') {
      await groupButton.click();
    }
    await expect(groupButton).toHaveAttribute('aria-expanded', 'true');
  }
}
