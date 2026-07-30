import { ConfigService, InjectModel, LoggingService } from '@douglasneuroinformatics/libnest';
import type { Model } from '@douglasneuroinformatics/libnest';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  ServiceUnavailableException
} from '@nestjs/common';
import type { Language } from '@opendatacapture/schemas/core';
import { $MailConfig, DEFAULT_NEW_USER_EMAIL_TEMPLATE, isMailEnabled } from '@opendatacapture/schemas/mail';
import type {
  EmailDeliveryResult,
  MailConfig,
  MailSettings,
  MailTemplate,
  TestMailData,
  TestMailResult,
  UpdateMailConfigData,
  UpdateMailSettingsData
} from '@opendatacapture/schemas/mail';
import { createTransport } from 'nodemailer';
import type { Transporter } from 'nodemailer';

import { decryptSecret, encryptSecret } from '@/core/secret-cipher';

import { describeMailError, encryptionToTransportFlags, formatSender, pickLocale, renderTemplate } from './mail.utils';

type SendOptions = {
  body: {
    html?: string;
    text: string;
  };
  subject: string;
  to: string;
};

/** Everything the service reads off `SetupState`, fetched in a single query. */
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

  /** The full SMTP configuration including the secret password, or null if never configured. */
  async getConfig(): Promise<MailConfig | null> {
    return (await this.readState()).config;
  }

  /** Admin-facing settings: the password is replaced by a `hasPassword` flag. */
  async getSettings(): Promise<MailSettings> {
    const { config, newUserEmailTemplate } = await this.readState();
    return { config: config ? this.toDto(config) : null, newUserEmailTemplate };
  }

  /** Whether outgoing email is both configured and switched on. */
  async isEnabled(): Promise<boolean> {
    return (await this.readState()).isEnabled;
  }

  /**
   * Email a remote-assignment link to a participant. The subject/body come from the caller (the
   * participant's group active template, or a default), and `{{url}}` / `{{expiresAt}}`
   * placeholders are substituted here.
   */
  async sendAssignmentEmail({
    body,
    expiresAt,
    recipient,
    subject: subjectTemplate,
    url
  }: {
    body: string;
    expiresAt: string;
    recipient: string;
    subject: string;
    url: string;
  }): Promise<EmailDeliveryResult> {
    const variables = { expiresAt, url };
    const rendered = renderTemplate(body, variables);
    // The assignment link is the whole point of this email, so if a custom template omits the
    // {{url}} placeholder we append the link rather than send a message the recipient can't act on.
    const message = rendered.includes(url) ? rendered : `${rendered}\n\n${url}`;
    const subject = renderTemplate(subjectTemplate, variables);

    const { config, isEnabled } = await this.readState();
    if (!isEnabled || !config) {
      return { message, recipient, status: 'DISABLED' };
    }
    try {
      await this.sendMail(config, { body: { text: message }, subject, to: recipient });
      return { message, recipient, status: 'SENT' };
    } catch (err) {
      this.loggingService.error(`Failed to send assignment email to ${recipient}: ${String(err)}`);
      return { error: describeMailError(err), message, recipient, status: 'FAILED' };
    }
  }

  /** Build and send the welcome email for a newly created user, in the requested language. */
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
    const { config, isEnabled, newUserEmailTemplate: template } = await this.readState();
    const variables = { firstName, group, lastName, url, username };
    const message = renderTemplate(pickLocale(template.body, language), variables);
    const subject = renderTemplate(pickLocale(template.subject, language), variables);

    if (!isEnabled || !config) {
      return { message, recipient: email, status: 'DISABLED' };
    }
    if (!email) {
      return { message, recipient: null, status: 'NO_RECIPIENT' };
    }
    try {
      await this.sendMail(config, { body: { text: message }, subject, to: email });
      return { message, recipient: email, status: 'SENT' };
    } catch (err) {
      this.loggingService.error(`Failed to send welcome email to ${email}: ${String(err)}`);
      return { error: describeMailError(err), message, recipient: email, status: 'FAILED' };
    }
  }

  /**
   * Test the SMTP connection, optionally sending a real message to `recipient`. When `config` is
   * supplied the (possibly unsaved) values are tested; otherwise the saved configuration is used.
   */
  async test({ config, recipient }: TestMailData): Promise<TestMailResult> {
    const saved = await this.getConfig();
    if (this.requiresNewPassword(config, saved)) {
      // The client already blocks this, so a code the UI maps to "check your credentials" is enough.
      return { error: 'AUTHENTICATION_FAILED', success: false };
    }
    const resolved = this.resolveConfig(config, saved);
    if (!resolved) {
      return { error: 'UNKNOWN', success: false };
    }
    const testMessage: SendOptions = {
      body: {
        text: 'This is a test email from Open Data Capture. Your mail server is configured correctly.'
      },
      subject: 'Open Data Capture — test email',
      to: recipient ?? ''
    };
    try {
      const transporter = this.createTransporter(resolved);
      await transporter.verify();
      if (recipient) {
        await this.send(transporter, resolved, testMessage);
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
  async updateSettings(data: UpdateMailSettingsData): Promise<MailSettings> {
    const setupState = await this.setupStateModel.findFirst();
    if (!setupState?.isSetup) {
      throw new ServiceUnavailableException('Cannot update mail settings before setup');
    }
    const saved = await this.getConfig();
    if (this.requiresNewPassword(data.config, saved)) {
      throw new BadRequestException('A password is required when changing the mail server');
    }
    const resolved = data.config ? this.resolveConfig(data.config, saved) : undefined;
    const nextConfig = resolved ? { ...resolved, password: this.encryptPassword(resolved.password) } : undefined;
    await this.setupStateModel.update({
      data: {
        ...(nextConfig ? { mailConfig: { set: nextConfig } } : {}),
        ...(data.newUserEmailTemplate ? { newUserEmailTemplate: { set: data.newUserEmailTemplate } } : {})
      },
      where: { id: setupState.id }
    });
    return this.getSettings();
  }

  private createTransporter(config: MailConfig): Transporter {
    return createTransport({
      auth: { pass: config.password, user: config.username },
      // Fail fast (e.g. on a wrong port) so the API returns a clear error rather than
      // hanging until the client request times out.
      connectionTimeout: 15_000,
      greetingTimeout: 15_000,
      host: config.host,
      port: config.port,
      socketTimeout: 20_000,
      ...encryptionToTransportFlags(config.encryption)
    });
  }

  /** Reverse {@link encryptPassword}. Propagates, so a key rotation surfaces instead of muting mail. */
  private decryptPassword(stored: string): string {
    return stored ? decryptSecret(stored, this.configService.getOrThrow('SECRET_KEY')) : '';
  }

  /** Encrypt the SMTP password so a database dump yields no working mail credential. */
  private encryptPassword(plaintext: string): string {
    return plaintext ? encryptSecret(plaintext, this.configService.getOrThrow('SECRET_KEY')) : '';
  }

  /**
   * Read `SetupState` once and narrow both mail fields off it.
   *
   * A stored configuration that no longer validates, or whose password no longer decrypts, is a
   * hard failure rather than "not configured": treating it as the latter makes every send return
   * `DISABLED` while the admin looks at a configured mail page, with nothing to explain it.
   */
  private async readState(): Promise<MailState> {
    const setupState = await this.setupStateModel.findFirst();
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
      config: parsed?.success ? { ...parsed.data, password: this.decryptPassword(parsed.data.password) } : null,
      isEnabled: isMailEnabled(stored),
      newUserEmailTemplate:
        hasStoredTemplate && body && subject ? { body, subject } : { ...DEFAULT_NEW_USER_EMAIL_TEMPLATE }
    };
  }

  /**
   * Whether the caller has to supply a password rather than inheriting the stored one.
   *
   * A blank password normally means "keep the stored one", so the secret never has to round-trip
   * to the client. That inheritance is confined to the server the password belongs to: otherwise
   * `POST /v1/mail/test` could aim an arbitrary host at the stored credential and read it back off
   * the resulting SMTP AUTH. Pointing at a different server is refused outright rather than
   * quietly blanking the password, which would break a working configuration on an unrelated edit.
   */
  private requiresNewPassword(partial: undefined | UpdateMailConfigData, saved: MailConfig | null): boolean {
    if (!partial || partial.password) {
      return false;
    }
    // `encryption` counts as part of the server's identity: without it an admin could flip a
    // configured host to `none` and have the test endpoint offer the stored password in the clear.
    return (
      saved?.host !== partial.host ||
      saved.username !== partial.username ||
      saved.port !== partial.port ||
      saved.encryption !== partial.encryption
    );
  }

  /**
   * Resolve a (possibly partial) update payload into a complete config. Callers reject the
   * payload with {@link requiresNewPassword} first, which is what makes inheriting a blank
   * password below safe.
   */
  private resolveConfig(partial: undefined | UpdateMailConfigData, saved: MailConfig | null): MailConfig | null {
    if (!partial) {
      return saved;
    }
    return {
      enabled: partial.enabled,
      encryption: partial.encryption,
      host: partial.host,
      password: partial.password ?? saved?.password ?? '',
      port: partial.port,
      senderAddress: partial.senderAddress,
      senderName: partial.senderName ?? null,
      username: partial.username
    };
  }

  private async send(transporter: Transporter, config: MailConfig, options: SendOptions): Promise<void> {
    await transporter.sendMail({
      from: formatSender(config),
      html: options.body.html,
      subject: options.subject,
      text: options.body.text,
      to: options.to
    });
  }

  /** Send a message using an already-resolved configuration. */
  private async sendMail(config: MailConfig, options: SendOptions): Promise<void> {
    await this.send(this.createTransporter(config), config, options);
  }

  private toDto(config: MailConfig): MailSettings['config'] {
    const { password, ...rest } = config;
    return { ...rest, hasPassword: Boolean(password) };
  }
}
