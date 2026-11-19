import type { Locator, Page } from '@playwright/test';

import { AppPage } from '../../route.page';

export class PermissionSetsPage extends AppPage {
  readonly destructiveActionDialog: Locator;
  readonly table: Locator;

  constructor(page: Page) {
    super(page);
    // libui's DataTable sets its own testid and takes none from the route.
    this.table = page.getByTestId('data-table');
    this.destructiveActionDialog = page.getByTestId('destructive-action-dialog');
  }

  /** Opens a row's actions menu and picks one; the menu renders in a portal outside the table. */
  async chooseRowAction(name: string, action: 'Delete' | 'Manage') {
    await this.search(name);
    await this.row(name).getByTestId('row-actions-trigger').click();
    await this.$ref.getByTestId('row-actions-dropdown').getByRole('menuitem', { name: action }).click();
  }

  nameCell(name: string): Locator {
    return this.row(name).getByTestId('permission-set-name');
  }

  row(name: string): Locator {
    return this.table.getByTestId('data-table-row').filter({ hasText: name });
  }

  /** Other specs share the list and can push a set past the first page, so find it by name. */
  async search(name: string) {
    await this.table.getByTestId('data-table-search-bar').getByRole('searchbox').fill(name);
  }
}
