import type { InitAppOptions } from '@opendatacapture/schemas/setup';
import type { Locator, Page } from '@playwright/test';

import { RootPage } from './__root.page';

export class SetupPage extends RootPage {
  readonly setupForm: Locator;

  constructor(page: Page) {
    super(page);
    this.setupForm = page.getByTestId('setup-form');
  }

  async fillSetupForm({ admin, dummySubjectCount, recordsPerSubject }: InitAppOptions) {
    await this.setupForm.locator('input[name="firstName"]').fill(admin.firstName);
    await this.setupForm.locator('input[name="lastName"]').fill(admin.lastName);
    await this.setupForm.locator('input[name="username"]').fill(admin.username);
    await this.setupForm.locator('input[name="password"]').fill(admin.password);
    await this.setupForm.locator('input[name="confirmPassword"]').fill(admin.password);
    await this.setupForm.locator('#initDemo-true').click();
    await this.setupForm.locator('input[name="dummySubjectCount"]').fill(dummySubjectCount?.toString() ?? '');
    await this.setupForm.locator('input[name="recordsPerSubject"]').fill(recordsPerSubject?.toString() ?? '');
    await this.setupForm.getByLabel('Submit').click();
  }
}
