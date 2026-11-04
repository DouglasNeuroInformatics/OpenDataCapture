import type { Locator, Page } from '@playwright/test';

import { AppPage } from '../../route.page';

export class PermissionSetPage extends AppPage {
  readonly deleteButton: Locator;
  readonly destructiveActionDialog: Locator;
  readonly ruleRows: Locator;

  constructor(page: Page) {
    super(page);
    this.ruleRows = page.getByTestId('permission-set-rule-row');
    this.deleteButton = page.getByTestId('delete-permission-set');
    this.destructiveActionDialog = page.getByTestId('destructive-action-dialog');
  }

  async confirmDelete() {
    await this.destructiveActionDialog.getByRole('button', { name: 'Yes' }).click();
  }
}
