import type { Locator, Page } from '@playwright/test';

import { AppPage } from '../route.page';

type WizardStepName = 'INSTRUMENTS' | 'REVIEW' | 'SUBJECTS';

export class RemoteAssignmentsPage extends AppPage {
  readonly breadcrumbs: Locator;
  /** The scrolling frame around the column mapping grid, capped so a wide file cannot lengthen the step. */
  readonly columnMapping: Locator;
  /** The page column the wizard must fit inside; `Layout` renders exactly one `main`. */
  readonly container: Locator;
  readonly fileInput: Locator;
  readonly mapStep: Locator;
  readonly selectAllSubjects: Locator;
  readonly timepointsStep: Locator;
  readonly useSelectedSubjects: Locator;
  readonly wizard: Locator;

  constructor(page: Page) {
    super(page);
    this.breadcrumbs = page.getByTestId('bulk-breadcrumbs');
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

  breadcrumb(step: WizardStepName): Locator {
    return this.$ref.getByTestId(`bulk-breadcrumb-${step}`);
  }

  async sourceMode(mode: 'FILE' | 'PASTE' | 'SELECT') {
    await this.$ref.getByTestId(`bulk-source-mode-${mode}`).click();
  }

  async uploadFile(file: Parameters<Locator['setInputFiles']>[0]) {
    await this.fileInput.setInputFiles(file);
  }
}
