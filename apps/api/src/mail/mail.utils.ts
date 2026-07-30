import type { Language, LocalizedString } from '@opendatacapture/schemas/core';
import type { MailConfig, MailEncryption, MailErrorCode } from '@opendatacapture/schemas/mail';

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

/**
 * Format an assignment's expiry for a recipient. Truncating to a bare UTC date shifts the day for
 * anyone west of UTC — an assignment expiring at 02:00Z reads as the next day in Montréal, where
 * it has in fact already expired — so the time and zone are rendered rather than dropped.
 */
export function formatExpiryDate(expiresAt: Date | number | string, language: Language): string {
  // Explicit components rather than dateStyle/timeStyle, which cannot be combined with timeZoneName.
  return new Intl.DateTimeFormat(language, {
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    month: 'long',
    timeZoneName: 'short',
    year: 'numeric'
  }).format(new Date(expiresAt));
}

/** Pick a language from a localized string, falling back to any available language when the requested one is empty. */
export function pickLocale(localized: LocalizedString, language: Language): string {
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- empty strings mean "no translation"; fall back intentionally
  return localized[language] || Object.values(localized).find((v) => v) || '';
}

/**
 * Classify a nodemailer/SMTP error — matching on the error code and, as a fallback, the message
 * text (SMTP libraries are inconsistent about codes).
 *
 * Returns a {@link MailErrorCode} rather than prose: the server does not know what language the
 * admin reads, so the client renders the message. The raw technical error is never surfaced, and
 * anything unrecognized (including timeouts) collapses to `UNKNOWN`.
 */
export function describeMailError(err: unknown): MailErrorCode {
  const e = (err ?? {}) as { code?: unknown; message?: unknown };
  const code = typeof e.code === 'string' ? e.code : '';
  const message = typeof e.message === 'string' ? e.message.toLowerCase() : '';
  const matches = (codes: string[], pattern: RegExp) => codes.includes(code) || pattern.test(message);

  if (matches(['EAUTH'], /invalid login|authentication failed|535|credentials|username and password/)) {
    return 'AUTHENTICATION_FAILED';
  }
  if (matches(['EDNS', 'ENOTFOUND'], /getaddrinfo|enotfound|not be found|unknown host/)) {
    return 'HOST_NOT_FOUND';
  }
  if (matches(['ECONNREFUSED'], /econnrefused|refused/)) {
    return 'CONNECTION_REFUSED';
  }
  if (matches(['ESOCKET'], /wrong version number|ssl routines|tls|certificate|self[- ]signed|esocket/)) {
    return 'INSECURE_CONNECTION';
  }
  if (matches(['EENVELOPE'], /envelope|sender address|from address|mail from/)) {
    return 'SENDER_REJECTED';
  }
  return 'UNKNOWN';
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
