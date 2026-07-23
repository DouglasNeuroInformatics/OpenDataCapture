import { InjectModel, LoggingService } from '@douglasneuroinformatics/libnest';
import type { Model } from '@douglasneuroinformatics/libnest';
import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { $MailConfig, DEFAULT_NEW_USER_EMAIL_TEMPLATE } from '@opendatacapture/schemas/mail';
import type {
  EmailDeliveryResult,
  MailConfig,
  MailLanguage,
  MailSettings,
  MailTemplate,
  TestMailData,
  TestMailResult,
  UpdateMailConfigData,
  UpdateMailSettingsData
} from '@opendatacapture/schemas/mail';
import { createTransport } from 'nodemailer';
import type { Transporter } from 'nodemailer';

import {
  buildSendRequest,
  buildVerifyRequest,
  describeMailError,
  encryptionToTransportFlags,
  formatSender,
  HttpMailError,
  pickLocale,
  renderTemplate
} from './mail.utils';

type SendOptions = {
  body: {
    html?: string;
    text: string;
  };
  subject: string;
  to: string;
};

/**
 * Handles all outgoing email for the application.
 *
 * Unlike libnest's `MailModule`, which binds a single transporter from static
 * options at boot, the SMTP configuration here is owned by the admin and stored in
 * the database (on `SetupState`). We therefore build a fresh nodemailer transporter
 * from the current configuration whenever we send, so changes take effect without a
 * restart and a "test connection" button can validate unsaved settings. We still
 * reuse the same underlying library (nodemailer) that libnest depends on.
 */
@Injectable()
export class MailService {
  constructor(
    @InjectModel('SetupState') private readonly setupStateModel: Model<'SetupState'>,
    private readonly loggingService: LoggingService
  ) {}

  /** The full SMTP configuration including the secret password, or null if never configured. */
  async getConfig(): Promise<MailConfig | null> {
    const setupState = await this.setupStateModel.findFirst();
    if (!setupState?.mailConfig) {
      return null;
    }
    // Validate the stored value so scalar columns (e.g. `encryption`) are narrowed
    // from `string` to their expected literal union types.
    const result = $MailConfig.safeParse(setupState.mailConfig);
    return result.success ? result.data : null;
  }

  /** The new-user welcome template, falling back to the seeded default. */
  async getNewUserEmailTemplate(): Promise<MailTemplate> {
    const setupState = await this.setupStateModel.findFirst();
    const body = setupState?.newUserEmailTemplate?.body;
    const subject = setupState?.newUserEmailTemplate?.subject;
    if (!body || !subject) {
      return { ...DEFAULT_NEW_USER_EMAIL_TEMPLATE };
    }
    return { body, subject };
  }

  /** Admin-facing settings: secrets are replaced by `hasPassword`/`hasApiKey` flags. */
  async getSettings(): Promise<MailSettings> {
    const config = await this.getConfig();
    return {
      config: config
        ? {
            awsAccessKeyId: config.awsAccessKeyId,
            awsRegion: config.awsRegion,
            domain: config.domain,
            enabled: config.enabled,
            encryption: config.encryption,
            hasApiKey: Boolean(config.apiKey),
            hasPassword: Boolean(config.password),
            host: config.host,
            port: config.port,
            provider: config.provider,
            region: config.region,
            senderAddress: config.senderAddress,
            senderName: config.senderName,
            transport: config.transport,
            username: config.username
          }
        : null,
      newUserEmailTemplate: await this.getNewUserEmailTemplate()
    };
  }

  /** Whether outgoing email is both configured and switched on. */
  async isEnabled(): Promise<boolean> {
    const config = await this.getConfig();
    if (!config?.enabled) {
      return false;
    }
    if (config.transport === 'http') {
      // Each provider needs its secret plus any provider-specific fields: Mailgun a sending
      // domain, SES an access key ID and region; SendGrid and Postmark need only the key/token.
      if (config.provider === 'mailgun') {
        return Boolean(config.apiKey && config.domain);
      }
      if (config.provider === 'ses') {
        return Boolean(config.apiKey && config.awsAccessKeyId && config.awsRegion);
      }
      return Boolean(config.apiKey);
    }
    return Boolean(config.host);
  }

  /**
   * Email a remote-assignment link to a participant. The subject/body come from the
   * caller (the participant's group active template, or a default), and `{{url}}` /
   * `{{expiresAt}}` placeholders are substituted here.
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

    if (!(await this.isEnabled())) {
      return { message, recipient, status: 'DISABLED' };
    }
    try {
      await this.sendMail({ body: { text: message }, subject, to: recipient });
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
    password,
    url,
    username
  }: {
    email?: null | string;
    firstName: string;
    group: string;
    language?: MailLanguage;
    lastName: string;
    password: string;
    url: string;
    username: string;
  }): Promise<EmailDeliveryResult> {
    const template = await this.getNewUserEmailTemplate();
    const variables = { firstName, group, lastName, password, url, username };
    const message = renderTemplate(pickLocale(template.body, language), variables);
    const subject = renderTemplate(pickLocale(template.subject, language), variables);

    if (!(await this.isEnabled())) {
      return { message, recipient: email, status: 'DISABLED' };
    }
    if (!email) {
      return { message, recipient: null, status: 'NO_RECIPIENT' };
    }
    try {
      await this.sendMail({ body: { text: message }, subject, to: email });
      return { message, recipient: email, status: 'SENT' };
    } catch (err) {
      this.loggingService.error(`Failed to send welcome email to ${email}: ${String(err)}`);
      return { error: describeMailError(err), message, recipient: email, status: 'FAILED' };
    }
  }

  /**
   * Test the SMTP connection, optionally sending a real message to `recipient`.
   * When `config` is supplied the (possibly unsaved) values are tested; otherwise
   * the saved configuration is used.
   */
  async test({ config, recipient }: TestMailData): Promise<TestMailResult> {
    const resolved = await this.resolveConfig(config);
    if (!resolved) {
      return { error: 'Mail has not been configured', success: false };
    }
    const testMessage: SendOptions = {
      body: {
        text: 'This is a test email from Open Data Capture. Your mail server is configured correctly.'
      },
      subject: 'Open Data Capture — test email',
      to: recipient ?? ''
    };
    try {
      if (resolved.transport === 'http') {
        await this.verifyHttp(resolved);
        if (recipient) {
          await this.sendViaHttp(resolved, testMessage);
        }
      } else {
        const transporter = this.createTransporter(resolved);
        await transporter.verify();
        if (recipient) {
          await this.send(transporter, resolved, testMessage);
        }
      }
      return { success: true };
    } catch (err) {
      return { error: describeMailError(err), success: false };
    }
  }

  /**
   * Persist the mail configuration and/or new-user template. A blank/omitted
   * `password` preserves the previously stored one so the secret never has to leave
   * the server. Returns the admin-facing settings (password stripped).
   */
  async updateSettings(data: UpdateMailSettingsData): Promise<MailSettings> {
    const setupState = await this.setupStateModel.findFirst();
    if (!setupState?.isSetup) {
      throw new ServiceUnavailableException('Cannot update mail settings before setup');
    }
    const nextConfig = data.config ? await this.resolveConfig(data.config) : undefined;
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

  /**
   * Resolve a (possibly partial) update payload into a complete config. A blank or
   * omitted secret (`password`/`apiKey`) keeps the previously saved one, so secrets
   * never have to round-trip to the client.
   */
  private async resolveConfig(partial?: UpdateMailConfigData): Promise<MailConfig | null> {
    const saved = await this.getConfig();
    if (!partial) {
      return saved;
    }
    // A blank/omitted secret means "keep the saved one"; only a non-empty value replaces it.
    let apiKey = saved?.apiKey ?? '';
    if (partial.apiKey) {
      apiKey = partial.apiKey;
    }
    let password = saved?.password ?? '';
    if (partial.password) {
      password = partial.password;
    }
    return {
      apiKey,
      awsAccessKeyId: partial.awsAccessKeyId,
      awsRegion: partial.awsRegion,
      domain: partial.domain,
      enabled: partial.enabled,
      encryption: partial.encryption,
      host: partial.host,
      password,
      port: partial.port,
      provider: partial.provider,
      region: partial.region,
      senderAddress: partial.senderAddress,
      senderName: partial.senderName ?? null,
      transport: partial.transport,
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

  /** Send a message using the currently saved configuration and its active transport. */
  private async sendMail(options: SendOptions): Promise<void> {
    const config = await this.getConfig();
    if (!config) {
      throw new Error('Mail has not been configured');
    }
    if (config.transport === 'http') {
      await this.sendViaHttp(config, options);
    } else {
      await this.send(this.createTransporter(config), config, options);
    }
  }

  /** Deliver a message through the provider's HTTP API. Throws {@link HttpMailError} on a non-2xx. */
  private async sendViaHttp(config: MailConfig, options: SendOptions): Promise<void> {
    const request = buildSendRequest(config, {
      html: options.body.html,
      subject: options.subject,
      text: options.body.text,
      to: options.to
    });
    const response = await fetch(request.url, {
      body: request.body,
      headers: request.headers,
      method: request.method
    });
    if (!response.ok) {
      throw new HttpMailError(response.status);
    }
  }

  /** Validate HTTP-transport credentials (and Mailgun domain/region) without sending a message. */
  private async verifyHttp(config: MailConfig): Promise<void> {
    const request = buildVerifyRequest(config);
    const response = await fetch(request.url, { headers: request.headers, method: request.method });
    if (!response.ok) {
      throw new HttpMailError(response.status);
    }
  }
}
