import type { Locator, Page } from '@playwright/test';

import { AppPage } from '../route.page';

export class UploadInstrumentPage extends AppPage {
  readonly errorHeading: Locator;
  readonly fileInput: Locator;
  readonly pageHeader: Locator;
  readonly submitButton: Locator;
  readonly templateButton: Locator;
  readonly tryAgainButton: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeader = page.getByTestId('page-header');
    this.fileInput = page.getByTestId('dropzone').locator('input[type="file"]');
    this.submitButton = page.getByRole('button', { name: 'Submit' });
    this.templateButton = page.getByRole('button', { name: 'Template' });
    this.errorHeading = page.getByRole('heading', { name: 'An error has happened within the request' });
    this.tryAgainButton = page.getByRole('button', { name: 'Try Again' });
  }

  async uploadFile(file: Parameters<Locator['setInputFiles']>[0]) {
    await this.fileInput.setInputFiles(file);
  }
}
