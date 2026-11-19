import type { Locator, Page } from '@playwright/test';

import { AppPage } from '../../../route.page';

export class SubjectAssignmentsPage extends AppPage {
  readonly assignmentRows: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    super(page);
    this.assignmentRows = page.getByTestId('data-table-row');
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });
  }
}
