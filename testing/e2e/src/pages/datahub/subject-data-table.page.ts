import type { Page } from '@playwright/test';

import { AppPage } from '../_app.page';

export class SubjectDataTablePage extends AppPage {
  constructor(page: Page) {
    super(page);
  }
}
