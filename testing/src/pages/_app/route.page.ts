import { expect } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';

import { RootPage } from '../__root.page';

export abstract class AppPage extends RootPage {
  readonly _requiresAuth = true;
  readonly groupSwitcher: Locator;
  readonly sidebar: Locator;

  constructor(page: Page) {
    super(page);
    this.sidebar = page.getByTestId('sidebar');
    this.groupSwitcher = this.sidebar.getByTestId('group-switcher');
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

  /**
   * Opens the sidebar group switcher and returns its options, for asserting which groups are offered.
   * An admin's switcher first renders from their own groups and becomes a select only once every group
   * on the platform has loaded, so wait for the select rather than clicking static text.
   */
  async openGroupSwitcher() {
    await expect(this.groupSwitcher).toHaveRole('combobox');
    await this.groupSwitcher.click();
    return this.$ref.getByRole('option');
  }

  async switchGroup(name: string) {
    const options = await this.openGroupSwitcher();
    await options.filter({ hasText: name }).click();
    await expect(this.groupSwitcher).toContainText(name);
  }
}
