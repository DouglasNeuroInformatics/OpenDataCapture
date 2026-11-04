import type { AppAction, AppSubjectName } from '@opendatacapture/schemas/core';
import type { PermissionSetScope } from '@opendatacapture/schemas/permission-set';
import type { Locator, Page } from '@playwright/test';

import { AppPage } from '../../route.page';

export class CreatePermissionSetPage extends AppPage {
  readonly form: Locator;

  constructor(page: Page) {
    super(page);
    this.form = page.getByTestId('permission-set-form');
  }

  /**
   * Fills the last new-rule row, then opens a fresh one beneath it. The scope is left alone when
   * omitted, which is how the row's default of the holder's groups is exercised.
   */
  async addRule({
    action,
    scope,
    subject
  }: {
    action: AppAction;
    scope?: PermissionSetScope;
    subject: AppSubjectName;
  }) {
    const row = this.form.getByTestId('add-rule-row').last();
    await this.selectRuleOption(row, 'rule-action', action);
    await this.selectRuleOption(row, 'rule-subject', subject);
    if (scope !== undefined) {
      await this.selectRuleOption(row, 'rule-scope', scope);
    }
    await row.getByTestId('rule-draft-add').click();
  }

  async fillName(name: string) {
    await this.form.locator('[name="name"]').fill(name);
  }

  async submit() {
    await this.form.getByLabel('Submit').click();
  }

  /** The items render in a portal outside the form, so they are found on the page. */
  private async selectRuleOption(row: Locator, field: 'rule-action' | 'rule-scope' | 'rule-subject', value: string) {
    await row.getByTestId(`${field}-select-trigger`).click();
    await this.$ref.getByTestId(`${field}-select-item-${value}`).click();
  }
}
