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
  isSameMailServer
} from '@opendatacapture/schemas/mail';
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
  renderTemplate
} from './mail.utils';

/** A message whose content is already rendered, ready to hand to a transporter. */
type MailMessage = {
  body: string;
  subject: string;
  to: string;
};

/** Everything the service reads off `SetupState`, validated and decrypted. */
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
    const state = await this.readState();
    const { body, subject } = state.newUserEmailTemplate;
    const variables = { firstName, group, lastName, url, username };
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
  async test({ config, recipient }: TestMailData): Promise<TestMailResult> {
    const { config: saved } = await this.readState();
    if (this.requiresNewPassword(config, saved)) {
      // The client already blocks this, so a code the UI maps to "check your credentials" is enough.
      return { error: 'AUTHENTICATION_FAILED', success: false };
    }
    const resolved = this.resolveConfig(config, saved);
    if (!resolved) {
      return { error: 'UNKNOWN', success: false };
    }
    try {
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
  async updateSettings(data: UpdateMailSettingsData): Promise<MailSettings> {
    const setupState = await this.setupStateModel.findFirst();
    if (!setupState?.isSetup) {
      throw new ServiceUnavailableException('Cannot update mail settings before setup');
    }
    const { config: saved } = this.parseState(setupState);
    if (this.requiresNewPassword(data.config, saved)) {
      throw new BadRequestException('A password is required when changing the mail server');
    }
    const resolved = data.config ? this.resolveConfig(data.config, saved) : undefined;
    const nextConfig = resolved ? { ...resolved, password: this.encryptPassword(resolved.password) } : undefined;
    const updated = await this.setupStateModel.update({
      data: {
        ...(nextConfig ? { mailConfig: { set: nextConfig } } : {}),
        ...(data.newUserEmailTemplate ? { newUserEmailTemplate: { set: data.newUserEmailTemplate } } : {})
      },
      where: { id: setupState.id }
    });
    return this.toSettings(this.parseState(updated));
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
      await this.send(this.createTransporter(config), config, { body: message, subject, to: recipient });
      return { message, recipient, status: 'SENT' };
    } catch (err) {
      this.loggingService.error(`Failed to send "${subject}" to ${recipient}: ${String(err)}`);
      return { error: describeMailError(err), message, recipient, status: 'FAILED' };
    }
  }

  /** Encrypt the SMTP password so a database dump yields no working mail credential. */
  private encryptPassword(plaintext: string): string {
    return plaintext ? encryptSecret(plaintext, this.configService.getOrThrow('SECRET_KEY')) : '';
  }

  /**
   * Validate and decrypt the two mail fields off a `SetupState` row.
   *
   * A stored configuration that no longer validates, or whose password no longer decrypts, is a
   * hard failure rather than "not configured": treating it as the latter makes every send return
   * `DISABLED` while the admin looks at a configured mail page, with nothing to explain it.
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
      config: parsed?.success ? { ...parsed.data, password: this.decryptPassword(parsed.data.password) } : null,
      isEnabled: isMailEnabled(stored),
      newUserEmailTemplate:
        hasStoredTemplate && body && subject ? { body, subject } : { ...DEFAULT_NEW_USER_EMAIL_TEMPLATE }
    };
  }

  private async readState(): Promise<MailState> {
    return this.parseState(await this.setupStateModel.findFirst());
  }

  /**
   * Whether the caller has to supply a password rather than inheriting the stored one. Inheritance
   * is confined to the server the password belongs to — see {@link isSameMailServer}.
   */
  private requiresNewPassword(partial: undefined | UpdateMailConfigData, saved: MailConfig | null): boolean {
    if (!partial || partial.password) {
      return false;
    }
    return !saved || !isSameMailServer(saved, partial);
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
