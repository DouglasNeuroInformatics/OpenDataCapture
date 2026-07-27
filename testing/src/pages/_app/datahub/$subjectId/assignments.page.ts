import type { Locator, Page } from '@playwright/test';

import { AppPage } from '../../route.page';

export class SubjectAssignmentsPage extends AppPage {
  readonly assignmentLink: Locator;
  readonly assignmentRows: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    super(page);
    this.assignmentRows = page.getByTestId('assignment-row');
    this.assignmentLink = page.getByRole('link', { name: 'Link to Assignment' });
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });
  }
}
