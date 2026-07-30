import type { Locator, Page } from '@playwright/test';

import { AppPage } from '../../../route.page';

export class SubjectRecordDetailPage extends AppPage {
  readonly instrumentGroupHeading: Locator;
  readonly resultsGroupHeading: Locator;
  readonly subjectGroupHeading: Locator;

  constructor(page: Page) {
    super(page);
    this.subjectGroupHeading = page.getByRole('heading', { exact: true, name: 'Subject' });
    this.instrumentGroupHeading = page.getByRole('heading', { exact: true, name: 'Instrument' });
    this.resultsGroupHeading = page.getByRole('heading', { exact: true, name: 'Results' });
  }
}
