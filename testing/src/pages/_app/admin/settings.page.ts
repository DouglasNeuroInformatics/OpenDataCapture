import { expect } from '@playwright/test';
import type { Locator, Page, Response } from '@playwright/test';

import { AppPage } from '../route.page';

type SettingsTab = 'features' | 'interface' | 'mail' | 'subject-identification';

export class AdminSettingsPage extends AppPage {
  readonly defaultAssignmentDurationInput: Locator;
  readonly mailEnableToggle: Locator;
  readonly mailHost: Locator;
  readonly mailPassword: Locator;
  readonly mailPort: Locator;
  readonly mailSaveConfig: Locator;
  readonly mailSenderAddress: Locator;
  readonly mailServerCard: Locator;
  readonly mailTestConnection: Locator;
  readonly mailUsername: Locator;
  readonly pageHeader: Locator;
  readonly uploaderToggle: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeader = page.getByTestId('page-header');
    this.uploaderToggle = page.getByRole('switch', { name: 'Enable Uploader' });
    this.defaultAssignmentDurationInput = page.getByTestId('default-assignment-duration-input');
    this.mailEnableToggle = page.getByTestId('mail-enabled-toggle');
    this.mailServerCard = page.getByTestId('mail-server-card');
    this.mailHost = page.getByTestId('mail-host');
    this.mailPort = page.getByTestId('mail-port');
    this.mailUsername = page.getByTestId('mail-username');
    this.mailPassword = page.getByTestId('mail-password');
    this.mailSenderAddress = page.getByTestId('mail-sender-address');
    this.mailSaveConfig = page.getByTestId('mail-save-config');
    this.mailTestConnection = page.getByTestId('mail-test-connection');
  }

  /**
   * Idempotent: a configuration left enabled by an earlier spec already shows the form. Needs a
   * stored configuration, which `api.setMailEnabled` always leaves.
   */
  async enableMail() {
    // Branch on the toggle's own state, not the card's visibility. `isVisible` is a point-in-time
    // check with no auto-waiting, so on a slow first paint it reports false for an instance where
    // mail is already on — and the click that follows then turns mail OFF for the whole instance,
    // which breaks this spec and any other running against a mail-enabled instance.
    await this.mailEnableToggle.waitFor({ state: 'visible' });
    if (!(await this.mailEnableToggle.isChecked())) {
      // Turning mail on saves the stored configuration at once, and the form then reloads from the
      // saved copy, which would overwrite anything typed before that save returns.
      const saved = this.waitForMailSave();
      await this.mailEnableToggle.click();
      await saved;
    }
    await this.mailServerCard.waitFor({ state: 'visible' });
  }

  async fillMailServerConfig({
    host,
    password,
    port,
    senderAddress,
    username
  }: {
    host: string;
    password: string;
    port: string;
    senderAddress: string;
    username: string;
  }) {
    await this.mailHost.fill(host);
    await this.mailPort.fill(port);
    await this.mailUsername.fill(username);
    await this.mailPassword.fill(password);
    await this.mailSenderAddress.fill(senderAddress);
  }

  /** Every tab stays in the page, hidden until chosen, so its controls are not visible before this. */
  async openTab(tab: SettingsTab) {
    await this.$ref.getByTestId(`settings-tab-${tab}`).click();
    await expect(this.tabPanel(tab)).toBeVisible();
  }

  async setDefaultAssignmentDuration(days: number) {
    await this.defaultAssignmentDurationInput.fill(String(days));
    await this.defaultAssignmentDurationInput.press('Enter');
  }

  tabPanel(tab: SettingsTab): Locator {
    return this.$ref.getByTestId(`settings-panel-${tab}`);
  }

  // The enable toggle and the save button send the same request, so this matches whichever saves next.
  waitForMailSave(): Promise<Response> {
    return this.$ref.waitForResponse(
      (response) => response.url().endsWith('/v1/mail/settings') && response.request().method() === 'PATCH'
    );
  }
}
