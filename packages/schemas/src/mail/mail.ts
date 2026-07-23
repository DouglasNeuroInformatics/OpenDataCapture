import { z } from 'zod/v4';

// ── Internal helpers (must precede all exports for import/exports-last) ───────

/**
 * How outgoing mail is delivered:
 * - `smtp` — a classic SMTP connection via nodemailer (host/port/encryption/username/password)
 * - `http` — the provider's HTTP sending API (an API key + provider-specific fields), which
 *            some networks require because outbound SMTP ports are blocked, and which gives
 *            clearer delivery feedback than SMTP
 */
const MAIL_TRANSPORT = ['smtp', 'http'] as const;

const $MailTransport = z.enum(MAIL_TRANSPORT);

/**
 * The provider whose HTTP API is used when `transport` is `http`. Each provider has a
 * distinct endpoint and authentication scheme (see the mail service), so this cannot be a
 * free-form value.
 * - `mailgun`  — `POST https://api.(eu.)mailgun.net/v3/{domain}/messages`, basic auth `api:{apiKey}`
 * - `sendgrid` — `POST https://api.sendgrid.com/v3/mail/send`, bearer `{apiKey}`
 * - `ses`      — `POST https://email.{awsRegion}.amazonaws.com/v2/email/outbound-emails`, AWS
 *                SigV4 signed with `awsAccessKeyId` + `apiKey` (the secret access key)
 * - `postmark` — `POST https://api.postmarkapp.com/email`, header `X-Postmark-Server-Token: {apiKey}`
 */
const MAIL_PROVIDER = ['mailgun', 'sendgrid', 'ses', 'postmark'] as const;

const $MailProvider = z.enum(MAIL_PROVIDER);

/**
 * The Mailgun API region. Mailgun serves EU-hosted domains from a separate endpoint, so the
 * wrong region yields a "domain not found" error even with a valid key.
 */
const MAIL_REGION = ['us', 'eu'] as const;

const $MailRegion = z.enum(MAIL_REGION);

/**
 * How the connection to the SMTP server is secured (SMTP transport only).
 * - `none`     — plain, unencrypted connection (typically port 25; not recommended)
 * - `starttls` — upgrade a plain connection to TLS via STARTTLS (typically port 587)
 * - `ssl`      — implicit TLS for the whole connection (typically port 465)
 */
const MAIL_ENCRYPTION = ['none', 'starttls', 'ssl'] as const;

const $MailEncryption = z.enum(MAIL_ENCRYPTION);

const $Port = z.number().int().positive().max(65535);

/**
 * The full mail configuration as persisted server-side, spanning both transports. This
 * includes the SMTP `password` and the HTTP `apiKey` and therefore must NEVER be returned to
 * a client — use {@link $MailConfigDto} for anything sent to the browser.
 *
 * Fields not relevant to the active `transport` (e.g. `host` while on `http`, or `domain`
 * while on `smtp`) are permitted to be empty; {@link checkTransportFields} enforces only the
 * fields the active transport actually needs. New fields are defaulted so a configuration
 * stored before HTTP-transport support still parses (and is treated as SMTP).
 */
const $MailConfigBase = z.object({
  /**
   * The provider secret used to authenticate against the HTTP API when `transport` is `http`:
   * an API key (Mailgun/SendGrid), a server token (Postmark), or the AWS secret access key
   * (SES). Secret; never sent to clients. Defaulted so pre-HTTP configurations still parse.
   */
  apiKey: z.string().default(''),
  /** AWS access key ID, paired with `apiKey` (the secret access key) when `provider` is `ses`. Not secret. */
  awsAccessKeyId: z.string().default(''),
  /** AWS region for SES (e.g. us-east-1), used when `provider` is `ses`. */
  awsRegion: z.string().default(''),
  /** Mailgun sending domain (e.g. mg.example.org), used when `provider` is `mailgun`. */
  domain: z.string().default(''),
  /** Master on/off switch. When false, the application behaves as if email did not exist. */
  enabled: z.boolean(),
  /** SMTP connection security (SMTP transport only). Defaulted so HTTP payloads may omit it. */
  encryption: $MailEncryption.default('starttls'),
  /** Hostname or IP of the SMTP server (e.g. smtp.gmail.com); SMTP transport only. */
  host: z.string().default(''),
  /** SMTP account password / app password. Secret; never sent to clients. SMTP transport only. */
  password: z.string().default(''),
  /** TCP port of the SMTP server; SMTP transport only. Defaulted so HTTP payloads may omit it. */
  port: $Port.default(587),
  /** The provider whose HTTP API is used; HTTP transport only. */
  provider: $MailProvider.default('mailgun'),
  /** Mailgun API region; used when `provider` is `mailgun`. */
  region: $MailRegion.default('us'),
  /** The "from" address that recipients will see */
  senderAddress: z.email(),
  /** Optional human-readable name shown alongside the sender address */
  senderName: z.string().nullish(),
  /** Which delivery mechanism is active. Defaulted to `smtp` for backward compatibility. */
  transport: $MailTransport.default('smtp'),
  /** SMTP account username (often identical to the sender address); SMTP transport only. */
  username: z.string().default('')
});

/**
 * The subset of config fields the transport check reads. Typing the check against only these
 * (rather than the full inferred config) lets the same function validate both the persisted
 * schema and the update schema, whose secret fields differ in optionality.
 */
type TransportCheckValue = {
  awsAccessKeyId: string;
  awsRegion: string;
  domain: string;
  host: string;
  provider: MailProvider;
  transport: MailTransport;
  username: string;
};

/**
 * Enforce only the fields the active transport (and provider) requires, so switching transports
 * or providers doesn't demand fields the others use. Secrets (`apiKey`/`password`) are validated
 * separately (they may be omitted on an update to keep the stored value), so they are
 * intentionally not checked here.
 */
const checkTransportFields = (ctx: z.core.ParsePayload<TransportCheckValue>) => {
  const value = ctx.value;
  if (value.transport === 'smtp') {
    if (!value.host) {
      ctx.issues.push({ code: 'custom', input: value.host, message: 'A host is required for SMTP', path: ['host'] });
    }
    if (!value.username) {
      ctx.issues.push({
        code: 'custom',
        input: value.username,
        message: 'A username is required for SMTP',
        path: ['username']
      });
    }
    return;
  }
  if (value.provider === 'mailgun' && !value.domain) {
    ctx.issues.push({
      code: 'custom',
      input: value.domain,
      message: 'A sending domain is required for Mailgun',
      path: ['domain']
    });
  }
  if (value.provider === 'ses') {
    if (!value.awsRegion) {
      ctx.issues.push({
        code: 'custom',
        input: value.awsRegion,
        message: 'An AWS region is required for Amazon SES',
        path: ['awsRegion']
      });
    }
    if (!value.awsAccessKeyId) {
      ctx.issues.push({
        code: 'custom',
        input: value.awsAccessKeyId,
        message: 'An AWS access key ID is required for Amazon SES',
        path: ['awsAccessKeyId']
      });
    }
  }
};

const $MailConfig = $MailConfigBase.check(checkTransportFields);

/**
 * The mail configuration as exposed to an authenticated admin client. The secret
 * `password`/`apiKey` are replaced by `hasPassword`/`hasApiKey` booleans so the UI
 * can indicate that a secret is set without ever transmitting it.
 */
const $MailConfigDto = $MailConfigBase.omit({ apiKey: true, password: true }).extend({
  hasApiKey: z.boolean(),
  hasPassword: z.boolean()
});

/**
 * The payload an admin submits to update the mail configuration. The secrets
 * (`password`/`apiKey`) are optional: when omitted or left blank the previously
 * stored value is kept, which lets the form round-trip without exposing them.
 */
const $UpdateMailConfigData = $MailConfigBase
  .omit({ apiKey: true, password: true })
  .extend({
    apiKey: z.string().optional(),
    password: z.string().optional()
  })
  .check(checkTransportFields);

/** The languages email content can be authored in; the sender chooses one when sending. */
const MAIL_LANGUAGE = ['en', 'es', 'fr'] as const;

const $MailLanguage = z.enum(MAIL_LANGUAGE);

/** A string authored in the instance's active languages. Each field is nullish so a template can target a single language; nullish (rather than just optional) matches Prisma's null-for-absent convention. */
const $LocalizedString = z.object({
  en: z.string().nullish(),
  es: z.string().nullish(),
  fr: z.string().nullish()
});

/**
 * An editable email template with per-language subject/body. Bodies may contain `{{variable}}`
 * placeholders. Content is authored in both languages; the sender selects one at send time.
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
 * Request body for the "test connection / send test email" endpoint. When
 * `config` is provided the supplied (possibly unsaved) settings are tested,
 * otherwise the saved configuration is used. When `recipient` is provided a real
 * test message is delivered to it; otherwise only the connection is verified.
 */
const $TestMailData = z.object({
  config: $UpdateMailConfigData.optional(),
  recipient: z.email().optional()
});

const $TestMailResult = z.object({
  error: z.string().nullish(),
  success: z.boolean()
});

/** Variables substituted into the new-user welcome template. */
const $NewUserEmailVariables = z.object({
  firstName: z.string(),
  group: z.string(),
  lastName: z.string(),
  password: z.string(),
  url: z.string(),
  username: z.string()
});

/** Variables substituted into the remote-assignment email template. */
const $AssignmentEmailVariables = z.object({
  expiresAt: z.string(),
  url: z.string()
});

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
  error: z.string().nullish(),
  message: z.string(),
  recipient: z.string().nullish(),
  status: $EmailDeliveryStatus
});

const $SendAssignmentEmailData = z.object({
  /** The language to send the email in. Defaults to English when omitted. */
  language: $MailLanguage.default('en'),
  recipient: z.email(),
  /**
   * Which remote-assignment template to send: a template id, `null` for the built-in default, or
   * omitted to fall back to the group's active template (then the built-in default).
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
      'Temporary password: {{password}}',
      'Group(s): {{group}}',
      '',
      'You can log in here: {{url}}',
      '',
      'For security, please change your password after signing in for the first time.',
      '',
      'New to Open Data Capture? This guide will help you get started:',
      'https://opendatacapture.org/en/docs/guides/how-to-get-started-with-odc/'
    ].join('\n'),
    es: [
      'Hola {{firstName}},',
      '',
      'Se ha creado una cuenta para usted en Open Data Capture.',
      '',
      'Nombre de usuario: {{username}}',
      'Contraseña temporal: {{password}}',
      'Grupo(s): {{group}}',
      '',
      'Puede iniciar sesión aquí: {{url}}',
      '',
      'Por seguridad, cambie su contraseña después de iniciar sesión por primera vez.',
      '',
      '¿Nuevo en Open Data Capture? Esta guía le ayudará a comenzar:',
      'https://opendatacapture.org/en/docs/guides/how-to-get-started-with-odc/'
    ].join('\n'),
    fr: [
      'Bonjour {{firstName}},',
      '',
      'Un compte a été créé pour vous sur Open Data Capture.',
      '',
      "Nom d'utilisateur : {{username}}",
      'Mot de passe temporaire : {{password}}',
      'Groupe(s) : {{group}}',
      '',
      'Vous pouvez vous connecter ici : {{url}}',
      '',
      'Pour des raisons de sécurité, veuillez changer votre mot de passe après votre première connexion.',
      '',
      'Nouveau sur Open Data Capture ? Ce guide vous aidera à démarrer :',
      'https://opendatacapture.org/fr/docs/guides/how-to-get-started-with-odc/'
    ].join('\n')
  },
  subject: {
    en: 'Your Open Data Capture account',
    es: 'Su cuenta de Open Data Capture',
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
    es: [
      'Hola,',
      '',
      'Se le ha asignado un cuestionario para completar en Open Data Capture.',
      '',
      'Por favor, complételo utilizando el enlace seguro a continuación:',
      '{{url}}',
      '',
      'Este enlace expira el {{expiresAt}}.',
      '',
      'Gracias.'
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
    es: 'Su evaluación de Open Data Capture',
    fr: 'Votre évaluation Open Data Capture'
  }
} as const satisfies z.infer<typeof $MailTemplate>;

// ── Template validation helpers ──────────────────────────────────────────────

/** Whether a body string contains a given `{{variable}}` placeholder. */
function hasVar(body: string, name: string): boolean {
  return new RegExp(`\\{\\{\\s*${name}\\s*\\}\\}`).test(body);
}

type TemplateIssue = 'incomplete' | 'missing-vars' | null;

/**
 * What (if anything) is wrong with a template for the given languages:
 * `incomplete` when a required language's subject/body is blank,
 * `missing-vars` when the body omits a required variable, otherwise `null`.
 * When no `languages` are supplied, checks all languages present in the template.
 */
function checkTemplateIssue(
  subject: LocalizedString,
  body: LocalizedString,
  requiredVars: readonly string[],
  languages?: readonly string[]
): TemplateIssue {
  const langs = languages ?? Object.keys(body).filter((k) => body[k as keyof LocalizedString]);
  if (langs.length === 0) {
    return 'incomplete';
  }
  for (const lang of langs) {
    const s = subject[lang as keyof LocalizedString];
    const b = body[lang as keyof LocalizedString];
    if (!s?.trim() || !b?.trim()) {
      return 'incomplete';
    }
    if (requiredVars.length > 0 && requiredVars.some((name) => !hasVar(b, name))) {
      return 'missing-vars';
    }
  }
  return null;
}

// ── Exports ──────────────────────────────────────────────────────────────────

export type { TemplateIssue };
export type AssignmentEmailVariables = z.infer<typeof $AssignmentEmailVariables>;
export type EmailDeliveryResult = z.infer<typeof $EmailDeliveryResult>;
export type EmailDeliveryStatus = z.infer<typeof $EmailDeliveryStatus>;
export type MailConfig = z.infer<typeof $MailConfig>;
export type MailConfigDto = z.infer<typeof $MailConfigDto>;
export type LocalizedString = z.infer<typeof $LocalizedString>;
export type MailEncryption = (typeof MAIL_ENCRYPTION)[number];
export type MailLanguage = (typeof MAIL_LANGUAGE)[number];
export type MailProvider = (typeof MAIL_PROVIDER)[number];
export type MailRegion = (typeof MAIL_REGION)[number];
export type MailSettings = z.infer<typeof $MailSettings>;
export type MailTemplate = z.infer<typeof $MailTemplate>;
export type MailTransport = (typeof MAIL_TRANSPORT)[number];
export type NewUserEmailVariables = z.infer<typeof $NewUserEmailVariables>;
export type SendAssignmentEmailData = z.infer<typeof $SendAssignmentEmailData>;
export type TestMailData = z.infer<typeof $TestMailData>;
export type TestMailResult = z.infer<typeof $TestMailResult>;
export type UpdateMailConfigData = z.infer<typeof $UpdateMailConfigData>;
export type UpdateMailSettingsData = z.infer<typeof $UpdateMailSettingsData>;

export {
  $AssignmentEmailVariables,
  $EmailDeliveryResult,
  $EmailDeliveryStatus,
  $LocalizedString,
  $MailConfig,
  $MailConfigDto,
  $MailEncryption,
  $MailLanguage,
  $MailProvider,
  $MailRegion,
  $MailSettings,
  $MailTemplate,
  $MailTransport,
  $NewUserEmailVariables,
  $SendAssignmentEmailData,
  $TestMailData,
  $TestMailResult,
  $UpdateMailConfigData,
  $UpdateMailSettingsData,
  checkTemplateIssue,
  DEFAULT_ASSIGNMENT_EMAIL_TEMPLATE,
  DEFAULT_NEW_USER_EMAIL_TEMPLATE,
  MAIL_ENCRYPTION,
  MAIL_LANGUAGE,
  MAIL_PROVIDER,
  MAIL_REGION,
  MAIL_TRANSPORT
};
