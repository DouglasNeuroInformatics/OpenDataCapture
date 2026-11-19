import type { Locator, Page } from '@playwright/test';

import { AppPage } from '../route.page';

export class StartSessionPage extends AppPage {
  readonly dateOfBirthField: Locator;
  readonly errorMessages: Locator;
  readonly pageHeader: Locator;
  readonly selectField: Locator;
  readonly sessionForm: Locator;
  /** Returns from the group's session instrument to the session details. */
  readonly sessionInstrumentBackButton: Locator;
  /** The form a group requires as part of starting a session, shown once the details are submitted. */
  readonly sessionInstrumentStep: Locator;
  /** The hidden native select that carries the value; `sexTrigger` is the control a user sees. */
  readonly sexField: Locator;
  readonly sexTrigger: Locator;
  /** Errors on the identifier field itself, unlike `errorMessages`, which spans the whole page. */
  readonly subjectIdErrors: Locator;
  readonly subjectIdField: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeader = page.getByTestId('page-header');
    this.sessionForm = page.getByTestId('start-session-form');
    this.sessionInstrumentBackButton = page.getByTestId('session-instrument-back');
    this.sessionInstrumentStep = page.getByTestId('session-instrument-step');
    this.selectField = page.locator('[name="subjectIdentificationMethod"]');
    this.successMessage = page.getByRole('heading', { name: 'Session Successfully Started' });
    this.errorMessages = page.getByTestId('error-message-text');
    this.subjectIdField = this.sessionForm.locator('[name="subjectId"]');
    this.dateOfBirthField = this.sessionForm.locator('[name="subjectDateOfBirth"]');
    this.sexField = this.sessionForm.locator('[name="subjectSex"]');
    this.sexTrigger = this.sessionForm.getByTestId('subjectSex-select-trigger');
    this.subjectIdErrors = this.sessionForm.locator('[data-field-group="subjectId"]').getByTestId('error-message-text');
    // The end session nav item opens a dialog rather than navigating, so it carries no route.
  }

  /** One of the fields an administrator defined for identifying subjects, in the order defined. */
  customField(index: number): Locator {
    return this.sessionForm.locator(`[name="customField${index}"]`);
  }

  /** Clicks outside the identifier combobox, which closes its popup and commits what was typed. */
  async dismissSubjectIdOptions() {
    // eslint-disable-next-line playwright/prefer-locator -- pageHeader is a Locator; the rule takes any name starting with "page" for a Page
    await this.pageHeader.click();
  }

  async fillCustomFields(values: string[]) {
    for (const [index, value] of values.entries()) {
      await this.customField(index).fill(value);
    }
  }

  async fillCustomIdentifier(customIdentifier: string, sex: string) {
    await this.typeSubjectId(customIdentifier);
    await this.fillSessionDetails(sex);
  }

  /** The date input commits what was typed only when it loses focus, so it is blurred explicitly. */
  async fillDateOfBirth(date: string) {
    await this.dateOfBirthField.fill(date);
    await this.dateOfBirthField.blur();
  }

  /** Everything the form needs beyond how the subject was identified. */
  async fillSessionDetails(sex: string) {
    await this.fillSubjectDetails(sex);
    await this.fillSessionTiming();
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

  /** A retrospective session dated today at midnight, without touching the subject's details. */
  async fillSessionTiming() {
    await this.selectRetrospective();
    await this.pickSessionDay(new Date().getDate());
  }

  /** The subject's date of birth and sex, leaving the session at its in-person default. */
  async fillSubjectDetails(sex: string) {
    await this.fillDateOfBirth('1990-01-01');
    await this.sexField.selectOption(sex);
  }

  /** A day of the month the date picker opens on, which is the browser's current month. */
  async pickSessionDay(day: number) {
    await this.sessionForm.getByTestId('datetime-date-trigger').click();
    await this.$ref
      .getByTestId('datepicker')
      .getByRole('button', { exact: true, name: String(day) })
      .click();
  }

  async selectIdentificationMethod(methodName: string) {
    await this.selectField.selectOption(methodName);
  }

  async selectRetrospective() {
    await this.sessionForm.locator('[name="sessionType"]').selectOption('Retrospective');
  }

  /** The time of day of a retrospective session, as `HH:MM:SS`. */
  async setSessionTime(time: string) {
    await this.sessionForm.getByTestId('datetime-time-input').fill(time);
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
