import type { Locator, Page } from '@playwright/test';

import { AppPage } from './_app.page';

export class StartSessionPage extends AppPage {
  readonly pageHeader: Locator;
  readonly selectField: Locator;
  readonly sessionForm: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeader = page.getByTestId('page-header');
    this.sessionForm = page.getByTestId('start-session-form');
    this.selectField = page.locator('[name="subjectIdentificationMethod"]');
    this.successMessage = page.getByRole('heading', { name: 'Session Successfully Started' });
  }

  async fillCustomIdentifier(customIdentifier: string, sex: string) {
    const subjectIdField = this.sessionForm.locator('[name="subjectId"]');
    const dateOfBirthField = this.sessionForm.locator('[name="subjectDateOfBirth"]');
    const sexSelector = this.sessionForm.locator('[name="subjectSex"]');
    const sessionTypeSelector = this.sessionForm.locator('[name="sessionType"]');
    const sessionDate = this.sessionForm.locator('[name="sessionDate"]');

    await subjectIdField.waitFor({ state: 'visible' });
    await subjectIdField.fill(customIdentifier);

    await dateOfBirthField.waitFor({ state: 'visible' });
    await dateOfBirthField.fill('1990-01-01');

    await sexSelector.selectOption(sex);

    await sessionTypeSelector.selectOption('Retrospective');

    await sessionDate.waitFor({ state: 'visible' });
    const expectedSessionDate = new Date().toISOString().split('T')[0]!;
    await sessionDate.fill(expectedSessionDate);
  }

  async fillSessionForm(firstName: string, lastName: string, sex: string) {
    const firstNameField = this.sessionForm.locator('[name="subjectFirstName"]');
    const lastNameField = this.sessionForm.locator('[name="subjectLastName"]');
    const dateOfBirthField = this.sessionForm.locator('[name="subjectDateOfBirth"]');
    const sexSelector = this.sessionForm.locator('[name="subjectSex"]');
    const sessionTypeSelector = this.sessionForm.locator('[name="sessionType"]');
    const sessionDate = this.sessionForm.locator('[name="sessionDate"]');

    await firstNameField.waitFor({ state: 'visible' });
    await firstNameField.fill(firstName);

    await lastNameField.waitFor({ state: 'visible' });
    await lastNameField.fill(lastName);

    await dateOfBirthField.waitFor({ state: 'visible' });
    await dateOfBirthField.fill('1990-01-01');

    await sexSelector.selectOption(sex);

    await sessionTypeSelector.selectOption('Retrospective');

    await sessionDate.waitFor({ state: 'visible' });
    const expectedSessionDate = new Date().toISOString().split('T')[0]!;
    await sessionDate.fill(expectedSessionDate);
  }

  async selectIdentificationMethod(methodName: string) {
    await this.selectField.selectOption(methodName);
  }

  async submitForm() {
    const submitButton = this.sessionForm.getByLabel('Submit');

    await submitButton.waitFor({ state: 'visible' });

    await submitButton.click();
  }
}
