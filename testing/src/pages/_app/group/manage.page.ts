import type { Locator, Page } from '@playwright/test';

import { AppPage } from '../route.page';

export class GroupManagePage extends AppPage {
  readonly pageHeader: Locator;
  readonly subjectIdDisplayLengthInput: Locator;
  // The shared `Form` component's own submit button always has `aria-label="Submit"`, regardless of
  // its visible text, so this is the correct accessible name even though no custom label is set here.
  readonly submitButton: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeader = page.getByTestId('page-header');
    this.subjectIdDisplayLengthInput = page.getByLabel('Preferred Subject ID Display Length');
    this.submitButton = page.getByRole('button', { name: 'Submit' });
  }

  instrumentCheckbox(title: string): Locator {
    return this.$ref.getByTestId(`instrument-checkbox-${title}`);
  }
}
