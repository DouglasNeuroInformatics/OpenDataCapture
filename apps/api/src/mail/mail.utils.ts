import { createHash, createHmac } from 'node:crypto';

import type { LocalizedString, MailConfig, MailEncryption, MailLanguage } from '@opendatacapture/schemas/mail';

// ── Internal helpers (must precede all exports for import/exports-last) ───────

/** Base URL for the Mailgun API, which differs by region (EU-hosted domains use a separate host). */
function mailgunBaseUrl(region: MailConfig['region']): string {
  return region === 'eu' ? 'https://api.eu.mailgun.net' : 'https://api.mailgun.net';
}

/** AWS region names are lowercase alphanumerics and hyphens (e.g. `us-east-1`, `eu-west-2`). */
const AWS_REGION_PATTERN = /^[a-z0-9-]+$/;

/**
 * Build the SES endpoint host from the configured region. The region is interpolated into the
 * request host, so it is validated against {@link AWS_REGION_PATTERN} first: without this a crafted
 * value (e.g. `evil.example/`) could redirect the request to an attacker-controlled host (SSRF).
 */
function sesHost(awsRegion: string): string {
  if (!AWS_REGION_PATTERN.test(awsRegion)) {
    throw new Error(`Invalid AWS region: ${awsRegion}`);
  }
  return `email.${awsRegion}.amazonaws.com`;
}

/** HTTP Basic `Authorization` header value for the given credentials. */
function basicAuth(user: string, pass: string): string {
  return `Basic ${Buffer.from(`${user}:${pass}`).toString('base64')}`;
}

/** Lowercase hex SHA-256 of a UTF-8 string. */
function sha256Hex(data: string): string {
  return createHash('sha256').update(data, 'utf8').digest('hex');
}

/** HMAC-SHA256 of `data` under `key`, returned as raw bytes so signing keys can be chained. */
function hmacSha256(key: Buffer | string, data: string): Buffer {
  return createHmac('sha256', key).update(data, 'utf8').digest();
}

/**
 * Compute the AWS Signature Version 4 `Authorization` and `x-amz-date` headers for a request.
 * AWS's HTTP APIs require every request to be signed with the secret access key over a canonical
 * form of the request, so we sign here (with `node:crypto`) rather than pull in the AWS SDK.
 * `extraHeaders` are additional headers to include in the signature beyond the mandatory
 * `host`/`x-amz-date` (e.g. `content-type` on a POST); their keys must be lowercase.
 */
function signAwsV4(params: {
  accessKeyId: string;
  body: string;
  extraHeaders: { [key: string]: string };
  host: string;
  method: 'GET' | 'POST';
  now: Date;
  path: string;
  region: string;
  secretAccessKey: string;
  service: string;
}): { authorization: string; 'x-amz-date': string } {
  const { accessKeyId, body, extraHeaders, host, method, now, path, region, secretAccessKey, service } = params;
  const amzDate = `${now.toISOString().slice(0, 19).replace(/[-:]/g, '')}Z`;
  const dateStamp = amzDate.slice(0, 8);

  const headers: { [key: string]: string } = { host, 'x-amz-date': amzDate, ...extraHeaders };
  const signedHeaderNames = Object.keys(headers).sort();
  const canonicalHeaders = `${signedHeaderNames.map((name) => `${name}:${headers[name]!.trim()}`).join('\n')}\n`;
  const signedHeaders = signedHeaderNames.join(';');
  const canonicalRequest = [method, path, '', canonicalHeaders, signedHeaders, sha256Hex(body)].join('\n');

  const scope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = ['AWS4-HMAC-SHA256', amzDate, scope, sha256Hex(canonicalRequest)].join('\n');

  const kDate = hmacSha256(`AWS4${secretAccessKey}`, dateStamp);
  const kRegion = hmacSha256(kDate, region);
  const kService = hmacSha256(kRegion, service);
  const kSigning = hmacSha256(kService, 'aws4_request');
  const signature = createHmac('sha256', kSigning).update(stringToSign, 'utf8').digest('hex');

  return {
    authorization: `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`,
    'x-amz-date': amzDate
  };
}

/** A fully-described outbound HTTP request to a provider's mail API. */
export type MailHttpRequest = {
  body?: string;
  headers: { [key: string]: string };
  method: 'GET' | 'POST';
  url: string;
};

/** A non-2xx response from a provider's HTTP API, carrying the status for {@link describeMailError}. */
export class HttpMailError extends Error {
  readonly status: number;

  constructor(status: number, message?: string) {
    super(message ?? `Mail API responded with status ${status}`);
    this.name = 'HttpMailError';
    this.status = status;
  }
}

/** What an outgoing message contains, independent of transport. */
export type MailMessage = {
  html?: string;
  subject: string;
  text: string;
  to: string;
};

/**
 * Substitute `{{key}}` placeholders in a template with the provided values.
 * Unknown placeholders are left untouched so a malformed template degrades
 * gracefully rather than throwing.
 */
export function renderTemplate(template: string, variables: { [key: string]: string }): string {
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key: string) => {
    return Object.prototype.hasOwnProperty.call(variables, key) ? variables[key]! : match;
  });
}

/** Format the RFC 5322 "from" header from the configured sender name/address. */
export function formatSender({ senderAddress, senderName }: Pick<MailConfig, 'senderAddress' | 'senderName'>): string {
  if (!senderName) {
    return senderAddress;
  }
  const escaped = senderName.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  return `"${escaped}" <${senderAddress}>`;
}

/** Pick a language from a localized string, falling back to any available language when the requested one is empty. */
export function pickLocale(localized: LocalizedString, language: MailLanguage): string {
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- empty strings mean "no translation"; fall back intentionally
  return localized[language] || Object.values(localized).find((v) => v) || '';
}

/**
 * Translate a nodemailer/SMTP error into a clear, actionable message — matching on the
 * error code and, as a fallback, the message text (SMTP libraries are inconsistent about
 * codes). The raw technical error is never surfaced; anything unrecognized (including
 * timeouts) returns a friendly generic message.
 */
export function describeMailError(err: unknown): string {
  if (err instanceof HttpMailError) {
    return describeHttpMailError(err.status);
  }
  const e = (err ?? {}) as { code?: unknown; message?: unknown };
  const code = typeof e.code === 'string' ? e.code : '';
  const message = typeof e.message === 'string' ? e.message.toLowerCase() : '';
  const matches = (codes: string[], pattern: RegExp) => codes.includes(code) || pattern.test(message);

  if (matches(['EAUTH'], /invalid login|authentication failed|535|credentials|username and password/)) {
    return 'Authentication failed — check the username and password or API key.';
  }
  if (matches(['EDNS', 'ENOTFOUND'], /getaddrinfo|enotfound|not be found|unknown host/)) {
    return 'The mail server could not be found — check the host name.';
  }
  if (matches(['ECONNREFUSED'], /econnrefused|refused/)) {
    return 'The mail server refused the connection — check the host and port.';
  }
  if (matches(['ESOCKET'], /wrong version number|ssl routines|tls|certificate|self[- ]signed|esocket/)) {
    return 'Could not establish a secure connection — check the port and encryption method.';
  }
  if (matches(['EENVELOPE'], /envelope|sender address|from address|mail from/)) {
    return 'The sender address was rejected — check the sender address.';
  }
  // Timeouts and anything else: keep it simple and non-technical.
  return 'Please check and reconfigure your mail settings and try again.';
}

/**
 * Map our user-facing `encryption` choice onto the nodemailer transport flags.
 * - `ssl`      → implicit TLS (`secure: true`, typically port 465)
 * - `starttls` → upgrade a plain connection (`requireTLS: true`, typically port 587)
 * - `none`     → plain connection (typically port 25)
 */
export function encryptionToTransportFlags(encryption: MailEncryption): { requireTLS: boolean; secure: boolean } {
  return {
    requireTLS: encryption === 'starttls',
    secure: encryption === 'ssl'
  };
}

/**
 * Build the provider-specific HTTP request that sends a single message. Mailgun expects a
 * form-encoded POST with basic auth (`api:{apiKey}`); SendGrid expects a JSON POST with a
 * bearer token. The sender is formatted identically to the SMTP path via {@link formatSender}.
 */
export function buildSendRequest(config: MailConfig, message: MailMessage, now: Date = new Date()): MailHttpRequest {
  switch (config.provider) {
    case 'mailgun': {
      const params = new URLSearchParams();
      params.set('from', formatSender(config));
      params.set('to', message.to);
      params.set('subject', message.subject);
      params.set('text', message.text);
      if (message.html) {
        params.set('html', message.html);
      }
      return {
        body: params.toString(),
        headers: {
          authorization: basicAuth('api', config.apiKey),
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        method: 'POST',
        url: `${mailgunBaseUrl(config.region)}/v3/${encodeURIComponent(config.domain)}/messages`
      };
    }
    case 'postmark': {
      return {
        body: JSON.stringify({
          From: formatSender(config),
          HtmlBody: message.html,
          Subject: message.subject,
          TextBody: message.text,
          To: message.to
        }),
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'X-Postmark-Server-Token': config.apiKey
        },
        method: 'POST',
        url: 'https://api.postmarkapp.com/email'
      };
    }
    case 'ses': {
      const host = sesHost(config.awsRegion);
      const path = '/v2/email/outbound-emails';
      const body = JSON.stringify({
        Content: {
          Simple: {
            Body: message.html
              ? { Html: { Data: message.html }, Text: { Data: message.text } }
              : { Text: { Data: message.text } },
            Subject: { Data: message.subject }
          }
        },
        Destination: { ToAddresses: [message.to] },
        FromEmailAddress: formatSender(config)
      });
      const signed = signAwsV4({
        accessKeyId: config.awsAccessKeyId,
        body,
        extraHeaders: { 'content-type': 'application/json' },
        host,
        method: 'POST',
        now,
        path,
        region: config.awsRegion,
        secretAccessKey: config.apiKey,
        service: 'ses'
      });
      return {
        body,
        headers: {
          authorization: signed.authorization,
          'Content-Type': 'application/json',
          'x-amz-date': signed['x-amz-date']
        },
        method: 'POST',
        url: `https://${host}${path}`
      };
    }
    default: {
      const content = [{ type: 'text/plain', value: message.text }];
      if (message.html) {
        content.push({ type: 'text/html', value: message.html });
      }
      return {
        body: JSON.stringify({
          content,
          from: { email: config.senderAddress, ...(config.senderName ? { name: config.senderName } : {}) },
          personalizations: [{ to: [{ email: message.to }] }],
          subject: message.subject
        }),
        headers: { authorization: `Bearer ${config.apiKey}`, 'Content-Type': 'application/json' },
        method: 'POST',
        url: 'https://api.sendgrid.com/v3/mail/send'
      };
    }
  }
}

/**
 * Build a lightweight authenticated GET that validates the credentials (and, for Mailgun, the
 * sending domain and region) without delivering a message — the HTTP equivalent of SMTP's
 * `verify()`. Mailgun's domain endpoint 404s on a wrong domain/region; SendGrid's scopes
 * endpoint 401s on a bad key.
 */
export function buildVerifyRequest(config: MailConfig, now: Date = new Date()): MailHttpRequest {
  switch (config.provider) {
    case 'mailgun': {
      return {
        headers: { authorization: basicAuth('api', config.apiKey) },
        method: 'GET',
        url: `${mailgunBaseUrl(config.region)}/v3/domains/${encodeURIComponent(config.domain)}`
      };
    }
    case 'postmark': {
      return {
        headers: { Accept: 'application/json', 'X-Postmark-Server-Token': config.apiKey },
        method: 'GET',
        url: 'https://api.postmarkapp.com/server'
      };
    }
    case 'ses': {
      const host = sesHost(config.awsRegion);
      const path = '/v2/account';
      const signed = signAwsV4({
        accessKeyId: config.awsAccessKeyId,
        body: '',
        extraHeaders: {},
        host,
        method: 'GET',
        now,
        path,
        region: config.awsRegion,
        secretAccessKey: config.apiKey,
        service: 'ses'
      });
      return {
        headers: { authorization: signed.authorization, 'x-amz-date': signed['x-amz-date'] },
        method: 'GET',
        url: `https://${host}${path}`
      };
    }
    default: {
      return {
        headers: { authorization: `Bearer ${config.apiKey}` },
        method: 'GET',
        url: 'https://api.sendgrid.com/v3/scopes'
      };
    }
  }
}

/**
 * Translate an HTTP status from a provider API into a clear, actionable message, mirroring
 * {@link describeMailError}'s treatment of SMTP errors. The raw response body is never surfaced.
 */
export function describeHttpMailError(status: number): string {
  if (status === 401 || status === 403) {
    return 'Authentication failed — check the API key.';
  }
  if (status === 404) {
    return 'The sending domain could not be found — check the domain and region.';
  }
  if (status === 400 || status === 422) {
    return 'The provider rejected the request — check the sending domain and sender address.';
  }
  if (status === 429) {
    return 'The provider is rate-limiting requests — please wait and try again.';
  }
  return 'Please check and reconfigure your mail settings and try again.';
}
