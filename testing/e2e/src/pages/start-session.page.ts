import type { Locator, Page } from '@playwright/test';

import { AppPage } from './_app.page';

export class StartSessionPage extends AppPage {
  readonly pageHeader: Locator;
  readonly selectField: Locator;
  readonly sessionForm: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeader = page.getByTestId('page-header');
    this.sessionForm = page.getByTestId('start-session-form');
    this.selectField = page.locator('[name="subjectIdentificationMethod"]');
  }

  async fillSessionForm(firstName: string) {
    await this.sessionForm.getByLabel('subjectId').fill(firstName);
  }

  async selectIdentificationMethod(methodName: string) {
    await this.selectField.selectOption(methodName);
  }
}
