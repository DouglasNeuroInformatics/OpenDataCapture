import { describe, expect, it } from 'vitest';

import {
  describeMailError,
  encryptionToTransportFlags,
  formatExpiryDate,
  formatSender,
  pickLocale,
  redactEmails,
  renderTemplate
} from '../mail.utils';

describe('renderTemplate', () => {
  it('substitutes known placeholders', () => {
    expect(
      renderTemplate('Hello {{firstName}}, your username is {{username}}', { firstName: 'Jane', username: 'jdoe' })
    ).toBe('Hello Jane, your username is jdoe');
  });

  it('tolerates surrounding whitespace in the placeholder', () => {
    expect(renderTemplate('{{ url }}', { url: 'https://x' })).toBe('https://x');
  });

  it('leaves unknown placeholders untouched', () => {
    expect(renderTemplate('Hi {{missing}}', { name: 'x' })).toBe('Hi {{missing}}');
  });
});

// Log lines and audit entries keep the domain mail went to, never who received it.
describe('redactEmails', () => {
  it('masks an address down to its first character and domain', () => {
    expect(redactEmails('bob.smith@example.org')).toBe('b***@example.org');
  });

  it('masks every local part to the same length, so the mask does not reveal it', () => {
    expect(redactEmails('a@example.org')).toBe(redactEmails('abcdefgh@example.org'));
  });

  it('masks an address an SMTP server echoes inside its error', () => {
    expect(redactEmails('550 5.1.1 <bob.smith@example.org>: Recipient address rejected')).toBe(
      '550 5.1.1 <b***@example.org>: Recipient address rejected'
    );
  });

  it('masks every address in the text', () => {
    expect(redactEmails('to alice@a.org, bob@b.org')).toBe('to a***@a.org, b***@b.org');
  });

  it('masks the whole local part when it holds an apostrophe or non-ASCII letters', () => {
    expect(redactEmails("o'brien@example.org")).toBe('o***@example.org');
    expect(redactEmails('jösé@example.org')).toBe('j***@example.org');
  });

  it('leaves text without an address unchanged', () => {
    expect(redactEmails('getaddrinfo ENOTFOUND smtp.invalid.test')).toBe('getaddrinfo ENOTFOUND smtp.invalid.test');
  });
});

describe('pickLocale', () => {
  it('returns the requested language', () => {
    expect(pickLocale({ en: 'Hello', fr: 'Bonjour' }, 'fr')).toBe('Bonjour');
    expect(pickLocale({ en: 'Hello', fr: 'Bonjour' }, 'en')).toBe('Hello');
  });

  it('falls back to the other language when the requested one is empty', () => {
    expect(pickLocale({ en: 'Hello', fr: '' }, 'fr')).toBe('Hello');
    expect(pickLocale({ en: '', fr: 'Bonjour' }, 'en')).toBe('Bonjour');
  });
});

describe('formatExpiryDate', () => {
  it('includes the time and zone rather than truncating to a UTC date', () => {
    const formatted = formatExpiryDate('2026-08-01T02:00:00Z', 'en');
    expect(formatted).not.toBe('2026-08-01');
    expect(formatted).toMatch(/\d{1,2}:\d{2}/);
  });

  it('renders in the requested language', () => {
    const date = '2026-08-01T12:00:00Z';
    expect(formatExpiryDate(date, 'fr')).not.toBe(formatExpiryDate(date, 'en'));
  });
});

describe('formatSender', () => {
  it('uses just the address when no name is set', () => {
    expect(formatSender({ senderAddress: 'a@b.org', senderName: null })).toBe('a@b.org');
  });

  it('quotes the name when present', () => {
    expect(formatSender({ senderAddress: 'a@b.org', senderName: 'ODC' })).toBe('"ODC" <a@b.org>');
  });

  it('escapes double quotes and backslashes in the name', () => {
    expect(formatSender({ senderAddress: 'a@b.org', senderName: 'Douglas "DNI" Lab' })).toBe(
      '"Douglas \\"DNI\\" Lab" <a@b.org>'
    );
    expect(formatSender({ senderAddress: 'a@b.org', senderName: 'back\\slash' })).toBe('"back\\\\slash" <a@b.org>');
  });
});

describe('encryptionToTransportFlags', () => {
  it('maps ssl to implicit TLS', () => {
    expect(encryptionToTransportFlags('ssl')).toEqual({ requireTLS: false, secure: true });
  });

  it('maps starttls to requireTLS', () => {
    expect(encryptionToTransportFlags('starttls')).toEqual({ requireTLS: true, secure: false });
  });

  it('maps none to a plain connection', () => {
    expect(encryptionToTransportFlags('none')).toEqual({ requireTLS: false, secure: false });
  });
});

// A code, not prose: the server cannot know what language the admin reads.
describe('describeMailError', () => {
  it('maps auth failures', () => {
    expect(describeMailError({ code: 'EAUTH' })).toBe('AUTHENTICATION_FAILED');
  });

  it('maps unknown host (by code or message)', () => {
    expect(describeMailError({ code: 'ENOTFOUND' })).toBe('HOST_NOT_FOUND');
    expect(describeMailError({ message: 'getaddrinfo ENOTFOUND smtp.bad' })).toBe('HOST_NOT_FOUND');
  });

  it('maps a refused connection', () => {
    expect(describeMailError({ code: 'ECONNREFUSED' })).toBe('CONNECTION_REFUSED');
  });

  it('maps TLS/version mismatch to an encryption hint', () => {
    expect(describeMailError({ code: 'ESOCKET' })).toBe('INSECURE_CONNECTION');
    expect(describeMailError({ message: 'SSL routines:tls_validate_record_header:wrong version number' })).toBe(
      'INSECURE_CONNECTION'
    );
  });

  it('maps a rejected sender address', () => {
    expect(describeMailError({ code: 'EENVELOPE' })).toBe('SENDER_REJECTED');
  });

  it('collapses timeouts to UNKNOWN', () => {
    expect(describeMailError({ code: 'ETIMEDOUT', message: 'Connection timeout' })).toBe('UNKNOWN');
  });

  it('never leaks a raw error, returning only a known code', () => {
    expect(describeMailError(new Error('0FC2C9C667C0000:error:0A00010B:SSL routines'))).not.toContain('0FC2C9');
    expect(describeMailError('something weird')).toBe('UNKNOWN');
  });
});
