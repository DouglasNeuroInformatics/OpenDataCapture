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

  async fillSessionForm(firstName: string, lastName: string, sex: string) {
    // Wait for the subjectFirstName field to appear after selecting PERSONAL_INFO
    const firstNameField = this.sessionForm.locator('[name="subjectFirstName"]');
    const lastNameField = this.sessionForm.locator('[name="subjectLastName"]');
    const dateOfBirthField = this.sessionForm.locator('[name="subjectDateOfBirth"]');
    const sexSelector = this.sessionForm.locator('[name="subjectSex"]');
    await firstNameField.waitFor({ state: 'visible' });
    await firstNameField.fill(firstName);

    await lastNameField.waitFor({ state: 'visible' });
    await lastNameField.fill(lastName);

    await dateOfBirthField.waitFor({ state: 'visible' });
    await dateOfBirthField.fill('01-01-1990');

    await sexSelector.selectOption(sex);
  }

  async selectIdentificationMethod(methodName: string) {
    await this.selectField.selectOption(methodName);
  }
}
