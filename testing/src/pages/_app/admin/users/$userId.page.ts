import type { AppAction, AppSubjectName } from '@opendatacapture/schemas/core';
import type { Locator, Page } from '@playwright/test';

import { AppPage } from '../../route.page';

export class AdminUserPage extends AppPage {
  readonly addPermissionRow: Locator;
  readonly adminNotice: Locator;
  readonly backLink: Locator;
  readonly manageAllWarning: Locator;
  readonly pageHeader: Locator;
  readonly permissionRows: Locator;
  readonly permissionsTable: Locator;
  readonly profileForm: Locator;
  readonly submitError: Locator;

  constructor(page: Page) {
    super(page);
    this.backLink = page.getByTestId('admin-user-back');
    this.pageHeader = page.getByTestId('page-header');
    this.profileForm = page.getByTestId('update-user-form');
    this.submitError = page.getByTestId('admin-user-edit-error');
    this.permissionsTable = page.getByTestId('user-permissions-table');
    this.permissionRows = page.getByTestId('user-permission-row');
    this.addPermissionRow = page.getByTestId('add-permission-row');
    this.adminNotice = page.getByTestId('user-permissions-admin-notice');
    this.manageAllWarning = page.getByTestId('manage-all-warning');
  }

  /**
   * Fills the add-permission form through the testids libui derives from its field keys. The scope
   * is left alone when omitted, which is how a single-group user's preselected group is exercised.
   */
  async addPermission({ action, scope, subject }: { action: AppAction; scope?: string; subject: AppSubjectName }) {
    await this.selectOption('action', action);
    await this.selectOption('subject', subject);
    if (scope !== undefined) {
      await this.selectOption('scope', scope);
    }
    await this.submitPermission();
  }

  async deleteUser() {
    await this.$ref.getByRole('button', { name: 'Delete User' }).click();
    await this.$ref.getByRole('button', { name: 'Yes' }).click();
  }

  async removePermission(index: number) {
    await this.permissionRows.nth(index).getByTestId('user-permission-remove').click();
  }

  async saveProfile() {
    // The shared `Form` component's own submit button always has `aria-label="Submit"`, even though
    // this form's visible label is "Save" -- see DouglasNeuroInformatics/libui#108.
    await this.profileForm.getByRole('button', { name: 'Submit' }).click();
  }

  /** Opens one of the add-permission selects; the items render in a portal outside the form. */
  async selectOption(field: 'action' | 'scope' | 'subject', value: string) {
    await this.addPermissionRow.getByTestId(`${field}-select-trigger`).click();
    await this.$ref.getByTestId(`${field}-select-item-${value}`).click();
  }

  async submitPermission() {
    await this.addPermissionRow.getByRole('button', { name: 'Add Permission' }).click();
  }
}
