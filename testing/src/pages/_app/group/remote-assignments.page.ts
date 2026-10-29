import type { Locator, Page } from '@playwright/test';

import { AppPage } from '../route.page';

type WizardStepName = 'INSTRUMENTS' | 'REVIEW' | 'SUBJECTS';

export class RemoteAssignmentsPage extends AppPage {
  readonly addTimepoint: Locator;
  readonly breadcrumbs: Locator;
  /** The scrolling frame around the column mapping grid, capped so a wide file cannot lengthen the step. */
  readonly columnMapping: Locator;
  /** The confirm button of the mapping step, which the refusals have to sit above. */
  readonly confirmMapping: Locator;
  readonly confirmTimepoints: Locator;
  /** The page column the wizard must fit inside; `Layout` renders exactly one `main`. */
  readonly container: Locator;
  readonly emailAll: Locator;
  readonly emailListApply: Locator;
  readonly emailListDropzone: Locator;
  readonly emailListMatched: Locator;
  readonly emailListToggle: Locator;
  readonly emailTable: Locator;
  readonly errorList: Locator;
  readonly fileInput: Locator;
  readonly instrumentSelect: Locator;
  readonly mapStep: Locator;
  readonly parsePasted: Locator;
  readonly pasteInput: Locator;
  readonly selectAllSubjects: Locator;
  readonly skipUnplaceable: Locator;
  readonly submitBatch: Locator;
  readonly timepointsStep: Locator;
  readonly useSelectedSubjects: Locator;
  readonly wizard: Locator;

  constructor(page: Page) {
    super(page);
    this.breadcrumbs = page.getByTestId('bulk-breadcrumbs');
    this.confirmMapping = page.getByTestId('bulk-confirm-mapping');
    this.emailAll = page.getByTestId('bulk-email-all');
    this.emailListApply = page.getByTestId('email-list-apply');
    // Same libui trap as `fileInput` below: FileDropzone hardcodes its own testid and forwards
    // none, so `email-list-dropzone` never reaches the DOM. In the subject-picker tab this panel
    // holds the only dropzone on the page.
    this.emailListDropzone = page.getByTestId('dropzone').locator('input[type="file"]');
    this.emailListMatched = page.getByTestId('email-list-matched');
    this.emailListToggle = page.getByTestId('email-list-upload-toggle');
    this.emailTable = page.getByTestId('bulk-email-table');
    this.errorList = page.getByTestId('bulk-error-list');
    this.parsePasted = page.getByTestId('bulk-parse-pasted');
    this.pasteInput = page.getByTestId('bulk-paste-input');
    this.skipUnplaceable = page.getByTestId('bulk-skip-unplaceable');
    this.addTimepoint = page.getByTestId('bulk-add-timepoint');
    this.confirmTimepoints = page.getByTestId('bulk-confirm-timepoints');
    this.instrumentSelect = page.getByTestId('bulk-instrument-select');
    this.submitBatch = page.getByTestId('bulk-submit');
    this.columnMapping = page.getByTestId('bulk-column-mapping');
    this.container = page.locator('main');
    // libui's FileDropzone hardcodes its own testid and forwards none, so the `bulk-file-dropzone`
    // the wizard passes it never reaches the DOM.
    this.fileInput = page.getByTestId('dropzone').locator('input[type="file"]');
    this.mapStep = page.getByTestId('bulk-map-step');
    this.selectAllSubjects = page.getByTestId('bulk-select-all-subjects');
    this.timepointsStep = page.getByTestId('bulk-timepoints-step');
    this.useSelectedSubjects = page.getByTestId('bulk-use-selected-subjects');
    this.wizard = page.getByTestId('bulk-remote-assignment-wizard');
  }

  /** Add the first offered instrument as a timepoint and continue to review. */
  async addFirstInstrument() {
    await this.instrumentSelect.click();
    await this.$ref.getByRole('option').first().click();
    await this.addTimepoint.click();
    await this.confirmTimepoints.click();
  }

  breadcrumb(step: WizardStepName): Locator {
    return this.$ref.getByTestId(`bulk-breadcrumb-${step}`);
  }

  /** Paste a batch and move to the mapping step with it. */
  async pasteSubjects(text: string) {
    await this.sourceMode('PASTE');
    await this.pasteInput.fill(text);
    await this.parsePasted.click();
  }

  async sourceMode(mode: 'FILE' | 'PASTE' | 'SELECT') {
    await this.$ref.getByTestId(`bulk-source-mode-${mode}`).click();
  }

  async uploadEmailList(file: Parameters<Locator['setInputFiles']>[0]) {
    await this.emailListDropzone.setInputFiles(file);
  }

  async uploadFile(file: Parameters<Locator['setInputFiles']>[0]) {
    await this.fileInput.setInputFiles(file);
  }
}
