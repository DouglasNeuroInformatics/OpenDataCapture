import type { Locator, Page } from '@playwright/test';

import { AppPage } from '../route.page';

export class GroupManagePage extends AppPage {
  /** Every row's date tag, in row order, for asserting they form a column. */
  readonly instrumentCreatedAtTags: Locator;
  /** Every row's preview button, in row order, for asserting they form a column. */
  readonly instrumentPreviewButtons: Locator;
  readonly pageHeader: Locator;
  readonly subjectIdDisplayLengthInput: Locator;
  // The shared `Form` component's own submit button always has `aria-label="Submit"`, regardless of
  // its visible text, so this is the correct accessible name even though no custom label is set here.
  readonly submitButton: Locator;

  constructor(page: Page) {
    super(page);
    this.instrumentCreatedAtTags = this.$ref.locator('[data-testid^="instrument-created-at-"]');
    this.instrumentPreviewButtons = this.$ref.locator('[data-testid^="instrument-preview-"]');
    this.pageHeader = page.getByTestId('page-header');
    this.subjectIdDisplayLengthInput = page.getByLabel('Preferred Subject ID Display Length');
    this.submitButton = page.getByRole('button', { name: 'Submit' });
  }

  instrumentCheckbox(title: string): Locator {
    return this.$ref.getByTestId(`instrument-checkbox-${title}`);
  }

  /** The tag showing the date an instrument was added. */
  instrumentCreatedAt(title: string): Locator {
    return this.$ref.getByTestId(`instrument-created-at-${title}`);
  }

  instrumentPreviewButton(title: string): Locator {
    return this.$ref.getByTestId(`instrument-preview-${title}`);
  }
}
