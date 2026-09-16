import type { Locator, Page } from '@playwright/test';

import { AppPage } from '../route.page';

type WizardStepName = 'INSTRUMENTS' | 'REVIEW' | 'SUBJECTS';

export class RemoteAssignmentsPage extends AppPage {
  readonly breadcrumbs: Locator;
  /** The page column the wizard must fit inside; `Layout` renders exactly one `main`. */
  readonly container: Locator;
  readonly selectAllSubjects: Locator;
  readonly timepointsStep: Locator;
  readonly useSelectedSubjects: Locator;
  readonly wizard: Locator;

  constructor(page: Page) {
    super(page);
    this.breadcrumbs = page.getByTestId('bulk-breadcrumbs');
    this.container = page.locator('main');
    this.selectAllSubjects = page.getByTestId('bulk-select-all-subjects');
    this.timepointsStep = page.getByTestId('bulk-timepoints-step');
    this.useSelectedSubjects = page.getByTestId('bulk-use-selected-subjects');
    this.wizard = page.getByTestId('bulk-remote-assignment-wizard');
  }

  breadcrumb(step: WizardStepName): Locator {
    return this.$ref.getByTestId(`bulk-breadcrumb-${step}`);
  }
}
