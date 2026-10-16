import { ConfigService, InjectModel, LoggingService } from '@douglasneuroinformatics/libnest';
import type { Model } from '@douglasneuroinformatics/libnest';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  ServiceUnavailableException
} from '@nestjs/common';
import type { Language } from '@opendatacapture/schemas/core';
import {
  $MailConfig,
  DEFAULT_NEW_USER_EMAIL_TEMPLATE,
  isMailEnabled,
  isSameMailServer,
  MAIL_TRANSPORT_TIMEOUTS
} from '@opendatacapture/schemas/mail';
import type {
  $TestMailData,
  $UpdateMailSettingsData,
  EmailDeliveryResult,
  MailConfig,
  MailSettings,
  MailTemplate,
  TestMailResult,
  UpdateMailConfigData
} from '@opendatacapture/schemas/mail';
import type { SetupState } from '@prisma/client';
import { createTransport } from 'nodemailer';
import type { Transporter } from 'nodemailer';

import { decryptSecret, encryptSecret } from '@/core/secret-cipher';

import {
  describeMailError,
  encryptionToTransportFlags,
  formatExpiryDate,
  formatSender,
  pickLocale,
  redactEmails,
  renderTemplate
} from './mail.utils';

/** A message whose content is already rendered, ready to hand to a transporter. */
type MailMessage = {
  body: string;
  subject: string;
  to: string;
};

/** Everything the service reads off `SetupState`, validated. The config's password remains the stored ciphertext. */
type MailState = {
  config: MailConfig | null;
  isEnabled: boolean;
  newUserEmailTemplate: MailTemplate;
};

/**
 * Handles all outgoing email for the application.
 *
 * Unlike libnest's `MailModule`, which binds a single transporter from static options at boot,
 * the SMTP configuration here is owned by the admin and stored in the database (on
 * `SetupState`). We therefore build a fresh nodemailer transporter from the current
 * configuration whenever we send, so changes take effect without a restart and a "test
 * connection" button can validate unsaved settings. We still reuse the same underlying library
 * (nodemailer) that libnest depends on.
 */
@Injectable()
export class MailService {
  constructor(
    @InjectModel('SetupState') private readonly setupStateModel: Model<'SetupState'>,
    private readonly configService: ConfigService,
    private readonly loggingService: LoggingService
  ) {}

  /** Admin-facing settings: the password is replaced by a `hasPassword` flag. */
  async getSettings(): Promise<MailSettings> {
    return this.toSettings(await this.readState());
  }

  /**
   * Email a remote-assignment link to a participant, rendering the chosen template in the
   * requested language.
   */
  async sendAssignmentEmail({
    expiresAt,
    language,
    recipient,
    template,
    url
  }: {
    expiresAt: Date | number | string;
    language: Language;
    recipient: string;
    template: MailTemplate;
    url: string;
  }): Promise<EmailDeliveryResult> {
    const variables = { expiresAt: formatExpiryDate(expiresAt, language), url };
    const rendered = renderTemplate(pickLocale(template.body, language), variables);
    return this.deliver(await this.readState(), {
      // The assignment link is the whole point of this email, so if a custom template omits the
      // {{url}} placeholder we append the link rather than send a message the recipient can't act on.
      message: rendered.includes(url) ? rendered : `${rendered}\n\n${url}`,
      recipient,
      subject: renderTemplate(pickLocale(template.subject, language), variables)
    });
  }

  /**
   * Build and send the welcome email for a newly created user, in the requested language.
   *
   * Never throws: the caller has already created the user, so a failure to even read the mail
   * state has to reach the admin as a FAILED result with a copy-pasteable message, not as an
   * error response on a creation that succeeded.
   */
  async sendNewUserEmail({
    email,
    firstName,
    group,
    language = 'en',
    lastName,
    url,
    username
  }: {
    email?: null | string;
    firstName: string;
    group: string;
    language?: Language;
    lastName: string;
    url: string;
    username: string;
  }): Promise<EmailDeliveryResult> {
    const variables = { firstName, group, lastName, url, username };
    let state: MailState;
    try {
      state = await this.readState();
    } catch (err) {
      this.loggingService.error(`Failed to read mail state for new user email: ${String(err)}`);
      return {
        error: 'UNKNOWN',
        message: renderTemplate(pickLocale(DEFAULT_NEW_USER_EMAIL_TEMPLATE.body, language), variables),
        recipient: email,
        status: 'FAILED'
      };
    }
    const { body, subject } = state.newUserEmailTemplate;
    return this.deliver(state, {
      message: renderTemplate(pickLocale(body, language), variables),
      recipient: email,
      subject: renderTemplate(pickLocale(subject, language), variables)
    });
  }

  /**
   * Test the SMTP connection, optionally sending a real message to `recipient`. When `config` is
   * supplied the (possibly unsaved) values are tested; otherwise the saved configuration is used.
   */
  async test({ config, recipient }: $TestMailData): Promise<TestMailResult> {
    const { config: saved } = await this.readState();
    const resolve = this.configResolver(config, saved);
    if (resolve === 'PASSWORD_REQUIRED') {
      return { error: 'PASSWORD_REQUIRED', success: false };
    }
    try {
      // Resolution decrypts an inherited stored password, so it belongs inside the collapse: an
      // undecryptable secret must report a code here exactly as it does on a real send.
      const resolved = resolve();
      if (!resolved) {
        return { error: 'UNKNOWN', success: false };
      }
      const transporter = this.createTransporter(resolved);
      await transporter.verify();
      if (recipient) {
        await this.send(transporter, resolved, {
          body: 'This is a test email from Open Data Capture. Your mail server is configured correctly.',
          subject: 'Open Data Capture — test email',
          to: recipient
        });
      }
      return { success: true };
    } catch (err) {
      return { error: describeMailError(err), success: false };
    }
  }

  /**
   * Persist the mail configuration and/or new-user template. A blank/omitted `password`
   * preserves the stored one so the secret never has to leave the server. Returns the
   * admin-facing settings (password stripped).
   */
  async updateSettings(data: $UpdateMailSettingsData): Promise<MailSettings> {
    const setupState = await this.setupStateModel.findFirst();
    if (!setupState?.isSetup) {
      throw new ServiceUnavailableException('Cannot update mail settings before setup');
    }
    const { config: saved } = this.parseState(setupState);
    let nextConfig: MailConfig | undefined;
    if (data.config) {
      const password = this.passwordSource(data.config, saved);
      if (!password) {
        throw new BadRequestException('A password is required when changing the mail server');
      }
      // A kept password is inherited as its stored ciphertext, so updating settings never has to
      // decrypt the old secret — after a SECRET_KEY rotation the admin recovers by re-entering it.
      nextConfig = this.mergeConfig(
        data.config,
        'plaintext' in password ? this.encryptPassword(password.plaintext) : password.ciphertext
      );
    }
    const updated = await this.setupStateModel.update({
      data: {
        ...(nextConfig ? { mailConfig: { set: nextConfig } } : {}),
        ...(data.newUserEmailTemplate ? { newUserEmailTemplate: { set: data.newUserEmailTemplate } } : {})
      },
      where: { id: setupState.id }
    });
    return this.toSettings(this.parseState(updated));
  }

  /**
   * How a (possibly partial) payload resolves into a complete config ready to authenticate with:
   * a resolver to call, or `PASSWORD_REQUIRED` when the payload may not inherit the stored
   * password. Calling the resolver decrypts an inherited password, so callers decide where that
   * failure lands.
   */
  private configResolver(
    partial: undefined | UpdateMailConfigData,
    saved: MailConfig | null
  ): 'PASSWORD_REQUIRED' | (() => MailConfig | null) {
    if (!partial) {
      return () => saved && this.decryptConfig(saved);
    }
    const password = this.passwordSource(partial, saved);
    if (!password) {
      return 'PASSWORD_REQUIRED';
    }
    return () =>
      this.mergeConfig(
        partial,
        'plaintext' in password ? password.plaintext : this.decryptPassword(password.ciphertext)
      );
  }

  private createTransporter(config: MailConfig): Transporter {
    return createTransport({
      auth: { pass: config.password, user: config.username },
      // The shared budget: clients derive their request timeouts from these same values, so the
      // server always fails (and reports) before a client gives up and aborts.
      connectionTimeout: MAIL_TRANSPORT_TIMEOUTS.connection,
      greetingTimeout: MAIL_TRANSPORT_TIMEOUTS.greeting,
      host: config.host,
      port: config.port,
      socketTimeout: MAIL_TRANSPORT_TIMEOUTS.socket,
      ...encryptionToTransportFlags(config.encryption)
    });
  }

  /** Swap the stored ciphertext for the plaintext password, immediately before it is used. */
  private decryptConfig(config: MailConfig): MailConfig {
    return { ...config, password: this.decryptPassword(config.password) };
  }

  /**
   * Reverse {@link encryptPassword}. Throws on a rotated key; callers sit inside a failure
   * collapse, so that surfaces as a FAILED result or test error rather than muting mail.
   */
  private decryptPassword(stored: string): string {
    return stored ? decryptSecret(stored, this.configService.getOrThrow('SECRET_KEY')) : '';
  }

  /**
   * Hand a rendered message to a transporter, collapsing every outcome into a delivery result.
   * The message comes back whatever happens, so the UI can offer it for manual sending.
   */
  private async deliver(
    { config, isEnabled }: MailState,
    { message, recipient, subject }: { message: string; recipient?: null | string; subject: string }
  ): Promise<EmailDeliveryResult> {
    if (!isEnabled || !config) {
      return { message, recipient, status: 'DISABLED' };
    }
    if (!recipient) {
      return { message, recipient: null, status: 'NO_RECIPIENT' };
    }
    try {
      await this.send(this.createTransporter(this.decryptConfig(config)), config, {
        body: message,
        subject,
        to: recipient
      });
      return { message, recipient, status: 'SENT' };
    } catch (err) {
      this.loggingService.error(redactEmails(`Failed to send "${subject}" to ${recipient}: ${String(err)}`));
      return { error: describeMailError(err), message, recipient, status: 'FAILED' };
    }
  }

  /** Encrypt the SMTP password so a database dump yields no working mail credential. */
  private encryptPassword(plaintext: string): string {
    return encryptSecret(plaintext, this.configService.getOrThrow('SECRET_KEY'));
  }

  /** Combine an update payload with an already-resolved password into a complete config. */
  private mergeConfig(partial: UpdateMailConfigData, password: string): MailConfig {
    return {
      enabled: partial.enabled,
      encryption: partial.encryption,
      host: partial.host,
      password,
      port: partial.port,
      senderAddress: partial.senderAddress,
      senderName: partial.senderName ?? null,
      username: partial.username
    };
  }

  /**
   * Validate the two mail fields off a `SetupState` row. The password stays as its stored
   * ciphertext — it is decrypted immediately before use, so a rotated SECRET_KEY breaks sending
   * (loudly, as a FAILED delivery) without also locking the admin out of the settings page that
   * would fix it.
   *
   * A stored configuration that no longer validates is a hard failure rather than "not
   * configured": treating it as the latter makes every send return `DISABLED` while the admin
   * looks at a configured mail page, with nothing to explain it.
   */
  private parseState(setupState: null | Pick<SetupState, 'mailConfig' | 'newUserEmailTemplate'>): MailState {
    const stored = setupState?.mailConfig;
    // Validate so scalar columns (e.g. `encryption`) narrow from `string` to their literal unions.
    const parsed = stored ? $MailConfig.safeParse(stored) : null;
    if (parsed && !parsed.success) {
      this.loggingService.error(`Stored mail configuration is invalid: ${parsed.error.message}`);
      throw new InternalServerErrorException('The stored mail configuration is invalid');
    }
    const { body, subject } = setupState?.newUserEmailTemplate ?? {};
    // Two empty objects are truthy, so check for actual content before preferring the stored one.
    const hasStoredTemplate = Boolean(body && subject && pickLocale(body, 'en') && pickLocale(subject, 'en'));
    return {
      config: parsed?.success ? parsed.data : null,
      isEnabled: isMailEnabled(stored),
      newUserEmailTemplate:
        hasStoredTemplate && body && subject ? { body, subject } : { ...DEFAULT_NEW_USER_EMAIL_TEMPLATE }
    };
  }

  /**
   * Where a payload's password comes from: its own, or for a blank one the stored ciphertext.
   * Inheritance is confined to the server the stored password belongs to — see
   * {@link isSameMailServer} — and null means the payload has to supply one.
   */
  private passwordSource(
    partial: UpdateMailConfigData,
    saved: MailConfig | null
  ): null | { ciphertext: string } | { plaintext: string } {
    if (partial.password) {
      return { plaintext: partial.password };
    }
    if (saved && isSameMailServer(saved, partial)) {
      return { ciphertext: saved.password };
    }
    return null;
  }

  private async readState(): Promise<MailState> {
    return this.parseState(await this.setupStateModel.findFirst());
  }

  private async send(transporter: Transporter, config: MailConfig, { body, subject, to }: MailMessage): Promise<void> {
    await transporter.sendMail({ from: formatSender(config), subject, text: body, to });
  }

  private toSettings({ config, newUserEmailTemplate }: MailState): MailSettings {
    if (!config) {
      return { config: null, newUserEmailTemplate };
    }
    const { password, ...rest } = config;
    return { config: { ...rest, hasPassword: Boolean(password) }, newUserEmailTemplate };
  }
}
