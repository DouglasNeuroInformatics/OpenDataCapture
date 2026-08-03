import type { Locator, Page } from '@playwright/test';

import { AppPage } from '../route.page';

export class MailSettingsPage extends AppPage {
  readonly enableToggle: Locator;
  readonly host: Locator;
  readonly password: Locator;
  readonly port: Locator;
  readonly saveConfig: Locator;
  readonly senderAddress: Locator;
  readonly sendTest: Locator;
  readonly serverCard: Locator;
  readonly templateBody: Locator;
  readonly templateCard: Locator;
  readonly templateSave: Locator;
  readonly testConnection: Locator;
  readonly testRecipient: Locator;
  readonly username: Locator;

  constructor(page: Page) {
    super(page);
    this.enableToggle = page.getByTestId('mail-enabled-toggle');
    this.serverCard = page.getByTestId('mail-server-card');
    this.host = page.getByTestId('mail-host');
    this.port = page.getByTestId('mail-port');
    this.username = page.getByTestId('mail-username');
    this.password = page.getByTestId('mail-password');
    this.senderAddress = page.getByTestId('mail-sender-address');
    this.saveConfig = page.getByTestId('mail-save-config');
    this.testConnection = page.getByTestId('mail-test-connection');
    this.testRecipient = page.getByTestId('mail-test-recipient');
    this.sendTest = page.getByTestId('mail-send-test');
    this.templateCard = page.getByTestId('mail-template-card');
    this.templateBody = page.getByTestId('new-user-template-body');
    this.templateSave = page.getByTestId('mail-template-save');
  }

  /** Idempotent: a configuration left enabled by an earlier spec already shows the form. */
  async enableMail() {
    // Branch on the toggle's own state, not the card's visibility. `isVisible` is a point-in-time
    // check with no auto-waiting, so on a slow first paint it reports false for an instance where
    // mail is already on — and the click that follows then turns mail OFF for the whole instance,
    // which breaks this spec and any other running against a mail-enabled instance.
    await this.enableToggle.waitFor({ state: 'visible' });
    if (!(await this.enableToggle.isChecked())) {
      await this.enableToggle.click();
    }
    await this.serverCard.waitFor({ state: 'visible' });
  }

  /** The validation message rendered under a field, keyed by that field's control id. */
  fieldError(field: string): Locator {
    return this.$ref.getByTestId(`mail-${field}-error`);
  }

  async fillServerConfig({
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
    await this.host.fill(host);
    await this.port.fill(port);
    await this.username.fill(username);
    await this.password.fill(password);
    await this.senderAddress.fill(senderAddress);
  }
}
