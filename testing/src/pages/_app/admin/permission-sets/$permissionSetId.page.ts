import type { Locator, Page } from '@playwright/test';

import { AppPage } from '../../route.page';

export class PermissionSetPage extends AppPage {
  readonly destructiveActionDialog: Locator;
  readonly ruleRows: Locator;

  constructor(page: Page) {
    super(page);
    this.ruleRows = page.getByTestId('permission-set-rule-row');
    this.destructiveActionDialog = page.getByTestId('destructive-action-dialog');
  }
}
