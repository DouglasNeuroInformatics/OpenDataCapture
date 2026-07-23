import type { MailConfig } from '@opendatacapture/schemas/mail';
import { describe, expect, it } from 'vitest';

import {
  buildSendRequest,
  buildVerifyRequest,
  describeHttpMailError,
  describeMailError,
  encryptionToTransportFlags,
  formatSender,
  HttpMailError,
  pickLocale,
  renderTemplate
} from '../mail.utils';

const baseHttpConfig: MailConfig = {
  apiKey: 'key-123',
  awsAccessKeyId: '',
  awsRegion: '',
  domain: 'mg.example.org',
  enabled: true,
  encryption: 'starttls',
  host: '',
  password: '',
  port: 587,
  provider: 'mailgun',
  region: 'us',
  senderAddress: 'noreply@example.org',
  senderName: 'ODC',
  transport: 'http',
  username: ''
};

const sesConfig: MailConfig = {
  ...baseHttpConfig,
  apiKey: 'aws-secret-key',
  awsAccessKeyId: 'AKIAEXAMPLE',
  awsRegion: 'us-east-1',
  provider: 'ses'
};

const postmarkConfig: MailConfig = { ...baseHttpConfig, apiKey: 'postmark-token', provider: 'postmark' };

const message = { subject: 'Hi', text: 'Body', to: 'p@x.org' };

// A fixed instant so the SES SigV4 signature is deterministic across test runs.
const fixedNow = new Date('2026-07-08T12:00:00Z');

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

describe('describeMailError', () => {
  it('maps auth failures', () => {
    expect(describeMailError({ code: 'EAUTH' })).toMatch(/authentication failed/i);
  });

  it('maps unknown host (by code or message)', () => {
    expect(describeMailError({ code: 'ENOTFOUND' })).toMatch(/could not be found/i);
    expect(describeMailError({ message: 'getaddrinfo ENOTFOUND smtp.bad' })).toMatch(/could not be found/i);
  });

  it('maps a refused connection', () => {
    expect(describeMailError({ code: 'ECONNREFUSED' })).toMatch(/refused/i);
  });

  it('maps TLS/version mismatch to an encryption hint', () => {
    expect(describeMailError({ code: 'ESOCKET' })).toMatch(/secure connection/i);
    expect(describeMailError({ message: 'SSL routines:tls_validate_record_header:wrong version number' })).toMatch(
      /secure connection/i
    );
  });

  it('returns the generic message for timeouts (no technical wording)', () => {
    const result = describeMailError({ code: 'ETIMEDOUT', message: 'Connection timeout' });
    expect(result).toBe('Please check and reconfigure your mail settings and try again.');
    expect(result).not.toMatch(/timeout|timed out/i);
  });

  it('never leaks a raw/unknown error', () => {
    expect(describeMailError(new Error('0FC2C9C667C0000:error:0A00010B:SSL routines'))).not.toMatch(/0FC2C9/);
    expect(describeMailError('something weird')).toBe('Please check and reconfigure your mail settings and try again.');
  });

  it('delegates HttpMailError to the http status mapping', () => {
    expect(describeMailError(new HttpMailError(401))).toMatch(/authentication failed/i);
    expect(describeMailError(new HttpMailError(404))).toMatch(/domain could not be found/i);
  });
});

describe('describeHttpMailError', () => {
  it('maps auth failures', () => {
    expect(describeHttpMailError(401)).toMatch(/authentication failed/i);
    expect(describeHttpMailError(403)).toMatch(/authentication failed/i);
  });

  it('maps a missing domain', () => {
    expect(describeHttpMailError(404)).toMatch(/domain could not be found/i);
  });

  it('maps a rejected request', () => {
    expect(describeHttpMailError(400)).toMatch(/rejected the request/i);
    expect(describeHttpMailError(422)).toMatch(/rejected the request/i);
  });

  it('maps rate limiting', () => {
    expect(describeHttpMailError(429)).toMatch(/rate-limiting/i);
  });

  it('falls back to the generic message for other statuses', () => {
    expect(describeHttpMailError(500)).toBe('Please check and reconfigure your mail settings and try again.');
  });
});

describe('buildSendRequest', () => {
  it('builds a form-encoded, basic-auth Mailgun request against the region endpoint', () => {
    const request = buildSendRequest(baseHttpConfig, message);
    expect(request.method).toBe('POST');
    expect(request.url).toBe('https://api.mailgun.net/v3/mg.example.org/messages');
    expect(request.headers.authorization).toMatch(/^Basic /);
    expect(request.headers['Content-Type']).toBe('application/x-www-form-urlencoded');
    const params = new URLSearchParams(request.body);
    expect(params.get('from')).toBe('"ODC" <noreply@example.org>');
    expect(params.get('to')).toBe('p@x.org');
    expect(params.get('subject')).toBe('Hi');
    expect(params.get('text')).toBe('Body');
  });

  it('uses the EU endpoint for eu-region Mailgun', () => {
    const request = buildSendRequest({ ...baseHttpConfig, region: 'eu' }, message);
    expect(request.url).toBe('https://api.eu.mailgun.net/v3/mg.example.org/messages');
  });

  it('builds a bearer-auth JSON SendGrid request', () => {
    const request = buildSendRequest({ ...baseHttpConfig, provider: 'sendgrid' }, message);
    expect(request.url).toBe('https://api.sendgrid.com/v3/mail/send');
    expect(request.headers.authorization).toBe('Bearer key-123');
    expect(request.headers['Content-Type']).toBe('application/json');
    const payload = JSON.parse(request.body!);
    expect(payload.from.email).toBe('noreply@example.org');
    expect(payload.personalizations[0].to[0].email).toBe('p@x.org');
    expect(payload.subject).toBe('Hi');
  });

  it('builds a token-authenticated Postmark request', () => {
    const request = buildSendRequest(postmarkConfig, message);
    expect(request.url).toBe('https://api.postmarkapp.com/email');
    expect(request.headers['X-Postmark-Server-Token']).toBe('postmark-token');
    const payload = JSON.parse(request.body!);
    expect(payload.From).toBe('"ODC" <noreply@example.org>');
    expect(payload.To).toBe('p@x.org');
    expect(payload.Subject).toBe('Hi');
    expect(payload.TextBody).toBe('Body');
  });

  it('builds a SigV4-signed SES request against the region endpoint', () => {
    const request = buildSendRequest(sesConfig, message, fixedNow);
    expect(request.method).toBe('POST');
    expect(request.url).toBe('https://email.us-east-1.amazonaws.com/v2/email/outbound-emails');
    expect(request.headers['x-amz-date']).toBe('20260708T120000Z');
    expect(request.headers.authorization).toContain(
      'AWS4-HMAC-SHA256 Credential=AKIAEXAMPLE/20260708/us-east-1/ses/aws4_request'
    );
    expect(request.headers.authorization).toContain('SignedHeaders=content-type;host;x-amz-date');
    expect(request.headers.authorization).toMatch(/Signature=[0-9a-f]{64}$/);
    const payload = JSON.parse(request.body!);
    expect(payload.FromEmailAddress).toBe('"ODC" <noreply@example.org>');
    expect(payload.Destination.ToAddresses).toEqual(['p@x.org']);
    expect(payload.Content.Simple.Subject.Data).toBe('Hi');
    expect(payload.Content.Simple.Body.Text.Data).toBe('Body');
  });

  it('produces a stable SES signature for the same inputs and instant', () => {
    const a = buildSendRequest(sesConfig, message, fixedNow);
    const b = buildSendRequest(sesConfig, message, fixedNow);
    expect(a.headers.authorization).toBe(b.headers.authorization);
  });

  it('rejects an AWS region that would inject a different request host', () => {
    expect(() => buildSendRequest({ ...sesConfig, awsRegion: 'evil.example/' }, message, fixedNow)).toThrow(
      'Invalid AWS region'
    );
  });
});

describe('buildVerifyRequest', () => {
  it('builds a Mailgun domain lookup', () => {
    const request = buildVerifyRequest(baseHttpConfig);
    expect(request.method).toBe('GET');
    expect(request.url).toBe('https://api.mailgun.net/v3/domains/mg.example.org');
    expect(request.headers.authorization).toMatch(/^Basic /);
  });

  it('builds a SendGrid scopes lookup', () => {
    const request = buildVerifyRequest({ ...baseHttpConfig, provider: 'sendgrid' });
    expect(request.url).toBe('https://api.sendgrid.com/v3/scopes');
    expect(request.headers.authorization).toBe('Bearer key-123');
  });

  it('builds a Postmark server lookup', () => {
    const request = buildVerifyRequest(postmarkConfig);
    expect(request.url).toBe('https://api.postmarkapp.com/server');
    expect(request.headers['X-Postmark-Server-Token']).toBe('postmark-token');
  });

  it('rejects an AWS region that would inject a different request host', () => {
    expect(() => buildVerifyRequest({ ...sesConfig, awsRegion: 'evil.example/' }, fixedNow)).toThrow(
      'Invalid AWS region'
    );
  });

  it('builds a SigV4-signed SES account lookup without a content-type header', () => {
    const request = buildVerifyRequest(sesConfig, fixedNow);
    expect(request.method).toBe('GET');
    expect(request.url).toBe('https://email.us-east-1.amazonaws.com/v2/account');
    expect(request.headers['x-amz-date']).toBe('20260708T120000Z');
    expect(request.headers.authorization).toContain('SignedHeaders=host;x-amz-date');
  });
});
