import type { Locator, Page } from '@playwright/test';

import { AppPage } from '../../route.page';

export class PermissionSetsPage extends AppPage {
  readonly createLink: Locator;
  readonly destructiveActionDialog: Locator;
  readonly table: Locator;

  constructor(page: Page) {
    super(page);
    // libui's DataTable sets its own testid and takes none from the route.
    this.table = page.getByTestId('data-table');
    this.createLink = page.getByTestId('create-permission-set');
    this.destructiveActionDialog = page.getByTestId('destructive-action-dialog');
  }

  /** Opens a row's actions menu and picks one; the menu renders in a portal outside the table. */
  async chooseRowAction(name: string, action: 'Delete' | 'Manage') {
    await this.row(name).getByTestId('row-actions-trigger').click();
    await this.$ref.getByTestId('row-actions-dropdown').getByRole('menuitem', { name: action }).click();
  }

  nameCell(name: string): Locator {
    return this.row(name).getByTestId('permission-set-name');
  }

  row(name: string): Locator {
    return this.table.getByTestId('data-table-row').filter({ hasText: name });
  }
}
