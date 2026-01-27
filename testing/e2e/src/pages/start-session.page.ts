import type { Locator, Page } from '@playwright/test';

import { AppPage } from './_app.page';

export class StartSessionPage extends AppPage {
  readonly pageHeader: Locator;
  readonly sessionForm: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeader = page.getByTestId('page-header');
    this.sessionForm = page.getByTestId('start-session-form');
  }

  async fillSessionForm(firstName: string) {
    await this.sessionForm.getByLabel('subjectId').fill(firstName);
  }

  async selectIdentificationMethod(methodName: string) {
    const methodTrigger = this.sessionForm.getByRole('combobox', { name: /identification method/i });
    await methodTrigger.click();
    // The options are usually rendered in a portal at the end of the body
    await methodTrigger.getByRole('option', { name: methodName }).click();
  }
}
