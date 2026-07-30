import { z } from 'zod/v4';

import { $Language, $LocalizedString } from '../core/core.js';

import type { LocalizedString } from '../core/core.js';

// ── Internal helpers (must precede all exports for import/exports-last) ───────

/**
 * How the connection to the SMTP server is secured.
 * - `none`     — plain, unencrypted connection (typically port 25; not recommended)
 * - `starttls` — upgrade a plain connection to TLS via STARTTLS (typically port 587)
 * - `ssl`      — implicit TLS for the whole connection (typically port 465)
 */
const MAIL_ENCRYPTION = ['none', 'starttls', 'ssl'] as const;

const $MailEncryption = z.enum(MAIL_ENCRYPTION);

const $Port = z.number().int().positive().max(65535);

/**
 * The mail configuration as persisted server-side. This includes the SMTP `password` and
 * therefore must NEVER be returned to a client — use {@link $MailConfigDto} for anything sent
 * to the browser.
 */
const $MailConfig = z.object({
  /** Master on/off switch. When false, the application behaves as if email did not exist. */
  enabled: z.boolean(),
  /** SMTP connection security. */
  encryption: $MailEncryption,
  /** Hostname or IP of the SMTP server (e.g. smtp.gmail.com). */
  host: z.string().min(1),
  /** SMTP account password / app password. Secret; never sent to clients. */
  password: z.string(),
  /** TCP port of the SMTP server. */
  port: $Port,
  /** The "from" address that recipients will see. */
  senderAddress: z.email(),
  /** Optional human-readable name shown alongside the sender address. */
  senderName: z.string().nullish(),
  /** SMTP account username (often identical to the sender address). */
  username: z.string().min(1)
});

/**
 * The mail configuration as exposed to an authenticated admin client. The secret `password` is
 * replaced by a `hasPassword` boolean so the UI can show that one is set without transmitting it.
 */
const $MailConfigDto = $MailConfig.omit({ password: true }).extend({
  hasPassword: z.boolean()
});

/**
 * The payload an admin submits to update the mail configuration. `password` is optional: when
 * omitted or left blank the stored value is kept, which lets the form round-trip without ever
 * holding the secret.
 */
const $UpdateMailConfigData = $MailConfig.omit({ password: true }).extend({
  password: z.string().optional()
});

/**
 * An editable email template with per-language subject/body. Bodies may contain `{{variable}}`
 * placeholders. The sender selects a language at send time.
 */
const $MailTemplate = z.object({
  body: $LocalizedString,
  subject: $LocalizedString
});

const $MailSettings = z.object({
  /** Null when the instance has never been configured */
  config: $MailConfigDto.nullable(),
  newUserEmailTemplate: $MailTemplate
});

const $UpdateMailSettingsData = z.object({
  config: $UpdateMailConfigData.optional(),
  newUserEmailTemplate: $MailTemplate.optional()
});

/**
 * Request body for the "test connection / send test email" endpoint. When `config` is provided
 * the supplied (possibly unsaved) settings are tested, otherwise the saved configuration is
 * used. When `recipient` is provided a real test message is delivered to it; otherwise only the
 * connection is verified.
 */
const $TestMailData = z.object({
  config: $UpdateMailConfigData.optional(),
  recipient: z.email().optional()
});

/**
 * Why an outgoing message could not be delivered. A code rather than prose, so the client can
 * render it in the reader's language — the server has no idea who is looking at the result.
 * - `AUTHENTICATION_FAILED` — the server rejected the username/password
 * - `HOST_NOT_FOUND`        — the host name does not resolve
 * - `CONNECTION_REFUSED`    — the host resolved but refused the connection
 * - `INSECURE_CONNECTION`   — TLS could not be established for the chosen port/encryption
 * - `SENDER_REJECTED`       — the server refused the configured sender address
 * - `UNKNOWN`               — anything else, including timeouts
 */
const MAIL_ERROR_CODE = [
  'AUTHENTICATION_FAILED',
  'HOST_NOT_FOUND',
  'CONNECTION_REFUSED',
  'INSECURE_CONNECTION',
  'SENDER_REJECTED',
  'UNKNOWN'
] as const;

const $MailErrorCode = z.enum(MAIL_ERROR_CODE);

const $TestMailResult = z.object({
  error: $MailErrorCode.nullish(),
  success: z.boolean()
});

/** Variables substituted into the new-user welcome template. */
type NewUserEmailVariables = {
  firstName: string;
  group: string;
  lastName: string;
  url: string;
  username: string;
};

/** Variables substituted into the remote-assignment email template. */
type AssignmentEmailVariables = {
  expiresAt: string;
  url: string;
};

/**
 * The outcome of an attempt to deliver a feature email (e.g. the new-user welcome
 * message). `message` always holds the fully-rendered, copy-pasteable text so the
 * UI can fall back to manual delivery when sending is impossible.
 * - `SENT`          — handed off to the provider successfully
 * - `FAILED`        — sending was attempted but errored
 * - `NO_RECIPIENT`  — mail is enabled but the record has no email address
 * - `DISABLED`      — mail is globally disabled (UI should ignore this silently)
 */
const $EmailDeliveryStatus = z.enum(['SENT', 'FAILED', 'NO_RECIPIENT', 'DISABLED']);

const $EmailDeliveryResult = z.object({
  error: $MailErrorCode.nullish(),
  message: z.string(),
  recipient: z.string().nullish(),
  status: $EmailDeliveryStatus
});

const $SendAssignmentEmailData = z.object({
  /** The language to send the email in. Defaults to English when omitted. */
  language: $Language.default('en'),
  recipient: z.email(),
  /**
   * Which template to send: a template id, `null` for the built-in default, or omitted to fall
   * back to the group's active template (then the built-in default).
   */
  templateId: z.string().nullish()
});

/** Default subject/body (per language) seeded into the new-user template the first time it is read. */
const DEFAULT_NEW_USER_EMAIL_TEMPLATE = {
  body: {
    en: [
      'Hello {{firstName}},',
      '',
      'An account has been created for you on Open Data Capture.',
      '',
      'Username: {{username}}',
      'Group(s): {{group}}',
      '',
      'You can log in here: {{url}}',
      '',
      'Your administrator will provide your password separately. For security, please change it after signing in for the first time.',
      '',
      'New to Open Data Capture? This guide will help you get started:',
      'https://opendatacapture.org/en/docs/guides/how-to-get-started-with-odc/'
    ].join('\n'),
    fr: [
      'Bonjour {{firstName}},',
      '',
      'Un compte a été créé pour vous sur Open Data Capture.',
      '',
      "Nom d'utilisateur : {{username}}",
      'Groupe(s) : {{group}}',
      '',
      'Vous pouvez vous connecter ici : {{url}}',
      '',
      'Votre administrateur vous transmettra votre mot de passe séparément. Pour des raisons de sécurité, veuillez le changer après votre première connexion.',
      '',
      'Nouveau sur Open Data Capture ? Ce guide vous aidera à démarrer :',
      'https://opendatacapture.org/fr/docs/guides/how-to-get-started-with-odc/'
    ].join('\n')
  },
  subject: {
    en: 'Your Open Data Capture account',
    fr: 'Votre compte Open Data Capture'
  }
} as const satisfies z.infer<typeof $MailTemplate>;

/** Default subject/body (per language) seeded into the remote-assignment template the first time it is read. */
const DEFAULT_ASSIGNMENT_EMAIL_TEMPLATE = {
  body: {
    en: [
      'Hello,',
      '',
      'You have been assigned a questionnaire to complete on Open Data Capture.',
      '',
      'Please complete it using the secure link below:',
      '{{url}}',
      '',
      'This link expires on {{expiresAt}}.',
      '',
      'Thank you.'
    ].join('\n'),
    fr: [
      'Bonjour,',
      '',
      'Un questionnaire vous a été assigné à compléter sur Open Data Capture.',
      '',
      'Veuillez le compléter en utilisant le lien sécurisé ci-dessous :',
      '{{url}}',
      '',
      'Ce lien expire le {{expiresAt}}.',
      '',
      'Merci.'
    ].join('\n')
  },
  subject: {
    en: 'Your Open Data Capture assignment',
    fr: 'Votre évaluation Open Data Capture'
  }
} as const satisfies z.infer<typeof $MailTemplate>;

/**
 * The single definition of "outgoing mail is on". `SetupService` reports this to clients as the
 * public `isMailEnabled` flag and `MailService` gates sending on it.
 *
 * It takes the **raw stored value** and validates it here, rather than a already-parsed config,
 * because that is the only way the two sides cannot disagree: a stored configuration that no
 * longer satisfies `$MailConfig` has to count as off for the client flag exactly as it does for
 * the server, which refuses to send with it.
 */
function isMailEnabled(storedConfig: unknown): boolean {
  const result = $MailConfig.safeParse(storedConfig);
  return result.success && result.data.enabled;
}

// ── Exports ──────────────────────────────────────────────────────────────────

export type { AssignmentEmailVariables, NewUserEmailVariables };
export type EmailDeliveryResult = z.infer<typeof $EmailDeliveryResult>;
export type EmailDeliveryStatus = z.infer<typeof $EmailDeliveryStatus>;
export type MailConfig = z.infer<typeof $MailConfig>;
export type MailConfigDto = z.infer<typeof $MailConfigDto>;
export type MailEncryption = (typeof MAIL_ENCRYPTION)[number];
export type MailErrorCode = (typeof MAIL_ERROR_CODE)[number];
export type MailSettings = z.infer<typeof $MailSettings>;
export type MailTemplate = z.infer<typeof $MailTemplate>;
export type SendAssignmentEmailData = z.infer<typeof $SendAssignmentEmailData>;
export type TestMailData = z.infer<typeof $TestMailData>;
export type TestMailResult = z.infer<typeof $TestMailResult>;
export type UpdateMailConfigData = z.infer<typeof $UpdateMailConfigData>;
export type UpdateMailSettingsData = z.infer<typeof $UpdateMailSettingsData>;

export {
  $EmailDeliveryResult,
  $EmailDeliveryStatus,
  $MailConfig,
  $MailConfigDto,
  $MailEncryption,
  $MailErrorCode,
  $MailSettings,
  $MailTemplate,
  $SendAssignmentEmailData,
  $TestMailData,
  $TestMailResult,
  $UpdateMailConfigData,
  $UpdateMailSettingsData,
  DEFAULT_ASSIGNMENT_EMAIL_TEMPLATE,
  DEFAULT_NEW_USER_EMAIL_TEMPLATE,
  isMailEnabled,
  MAIL_ENCRYPTION,
  MAIL_ERROR_CODE
};
