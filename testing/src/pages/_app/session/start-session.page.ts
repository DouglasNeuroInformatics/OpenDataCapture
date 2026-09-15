import type { Locator, Page } from '@playwright/test';

import { AppPage } from '../route.page';

export class StartSessionPage extends AppPage {
  readonly endSessionButton: Locator;
  readonly errorMessages: Locator;
  readonly pageHeader: Locator;
  readonly selectField: Locator;
  readonly sessionForm: Locator;
  readonly subjectIdField: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeader = page.getByTestId('page-header');
    this.sessionForm = page.getByTestId('start-session-form');
    this.selectField = page.locator('[name="subjectIdentificationMethod"]');
    this.successMessage = page.getByRole('heading', { name: 'Session Successfully Started' });
    this.errorMessages = page.getByTestId('error-message-text');
    this.subjectIdField = this.sessionForm.locator('[name="subjectId"]');
    // The end session nav item opens a dialog rather than navigating, so it carries no route.
    this.endSessionButton = page.getByTestId('nav-button-#');
  }

  /** Clicks outside the identifier combobox, which closes its popup and commits what was typed. */
  async dismissSubjectIdOptions() {
    await this.pageHeader.click();
  }

  async endSession() {
    await this.endSessionButton.click();
    await this.$ref.getByRole('button', { name: 'Yes' }).click();
    await this.sessionForm.waitFor({ state: 'visible' });
  }

  async fillCustomIdentifier(customIdentifier: string, sex: string) {
    await this.typeSubjectId(customIdentifier);
    await this.fillSessionDetails(sex);
  }

  /** Everything the form needs beyond how the subject was identified. */
  async fillSessionDetails(sex: string) {
    const dateOfBirthField = this.sessionForm.locator('[name="subjectDateOfBirth"]');
    const sexSelector = this.sessionForm.locator('[name="subjectSex"]');
    const sessionTypeSelector = this.sessionForm.locator('[name="sessionType"]');
    const sessionDate = this.sessionForm.locator('[name="sessionDate"]');

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

    await firstNameField.waitFor({ state: 'visible' });
    await firstNameField.fill(firstName);

    await lastNameField.waitFor({ state: 'visible' });
    await lastNameField.fill(lastName);

    await this.fillSessionDetails(sex);
  }

  async selectIdentificationMethod(methodName: string) {
    await this.selectField.selectOption(methodName);
  }

  /** An identifier already in use by a subject in the current group, offered in the popup. */
  subjectIdOption(identifier: string) {
    return this.$ref.getByTestId(`subjectId-combobox-item-${identifier}`);
  }

  async submitForm() {
    const submitButton = this.sessionForm.getByLabel('Submit');

    await submitButton.waitFor({ state: 'visible' });

    await submitButton.click();
  }

  /** Types into the identifier combobox, leaving the options popup open. */
  async typeSubjectId(identifier: string) {
    await this.subjectIdField.waitFor({ state: 'visible' });
    await this.subjectIdField.fill(identifier);
  }
}
