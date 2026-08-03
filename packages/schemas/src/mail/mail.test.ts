import { describe, expect, it } from 'vitest';

import {
  $MailConfig,
  $MailConfigDto,
  $UpdateMailConfigData,
  DEFAULT_ASSIGNMENT_EMAIL_TEMPLATE,
  DEFAULT_NEW_USER_EMAIL_TEMPLATE,
  isMailEnabled,
  isSameMailServer
} from './mail.js';

import type { MailConfig } from './mail.js';

const config: MailConfig = {
  enabled: true,
  encryption: 'starttls',
  host: 'smtp.example.org',
  password: 'secret',
  port: 587,
  senderAddress: 'noreply@example.org',
  senderName: 'ODC',
  username: 'user'
};

describe('$MailConfig', () => {
  it('should accept a complete SMTP configuration', () => {
    expect($MailConfig.safeParse(config).success).toBe(true);
  });

  it.each(['host', 'username'])('should reject a blank %s', (field) => {
    expect($MailConfig.safeParse({ ...config, [field]: '' }).success).toBe(false);
  });

  it('should reject a sender address that is not an email', () => {
    expect($MailConfig.safeParse({ ...config, senderAddress: 'not-an-email' }).success).toBe(false);
  });

  it.each([0, 65536, 1.5])('should reject the port %s', (port) => {
    expect($MailConfig.safeParse({ ...config, port }).success).toBe(false);
  });
});

// The whole reason these two schemas exist is that the password must never reach a client.
describe('$MailConfigDto', () => {
  it('should strip the password from a parsed configuration', () => {
    const parsed = $MailConfigDto.parse({ ...config, hasPassword: true });
    expect(parsed).not.toHaveProperty('password');
    expect(parsed.hasPassword).toBe(true);
  });

  it('should not accept a password even when one is supplied', () => {
    expect($MailConfigDto.parse({ ...config, hasPassword: true, password: 'leaked' })).not.toHaveProperty('password');
  });
});

describe('$UpdateMailConfigData', () => {
  it('should accept an update that omits the password', () => {
    const { password: _password, ...withoutPassword } = config;
    expect($UpdateMailConfigData.safeParse(withoutPassword).success).toBe(true);
  });

  it('should accept an update that sets a new password', () => {
    expect($UpdateMailConfigData.parse(config).password).toBe('secret');
  });

  it('should normalize a blank password to undefined, so no consumer can mistake it for a new secret', () => {
    expect($UpdateMailConfigData.parse({ ...config, password: '' }).password).toBeUndefined();
  });
});

describe('isMailEnabled', () => {
  it('should be true for a configuration that is switched on', () => {
    expect(isMailEnabled(config)).toBe(true);
  });

  it.each([
    ['disabled', { ...config, enabled: false }],
    ['null', null],
    ['undefined', undefined]
  ])('should be false when the configuration is %s', (_label, value) => {
    expect(isMailEnabled(value)).toBe(false);
  });

  // The server refuses to send with a config that no longer parses, so the public flag has to
  // agree — otherwise the UI offers email that silently never arrives.
  it.each([
    ['a blank host', { ...config, host: '' }],
    ['a blank username', { ...config, username: '' }],
    ['an unparseable sender address', { ...config, senderAddress: 'not-an-email' }]
  ])('should be false for a stored configuration with %s, even when enabled', (_label, value) => {
    expect(value.enabled).toBe(true);
    expect(isMailEnabled(value)).toBe(false);
  });
});

// Both the API (which refuses the update) and the mail settings form (which asks for the password
// back) branch on this, so a disagreement would let the stored secret reach an unintended server.
describe('isSameMailServer', () => {
  it('should be true when only non-identifying fields differ', () => {
    const rebranded: MailConfig = { ...config, senderAddress: 'other@example.org', senderName: 'Other' };
    expect(isSameMailServer(config, rebranded)).toBe(true);
  });

  it.each<[string, MailConfig]>([
    ['host', { ...config, host: 'smtp.other.org' }],
    ['username', { ...config, username: 'other' }],
    ['port', { ...config, port: 2525 }],
    ['encryption', { ...config, encryption: 'none' }]
  ])('should be false when the %s differs, since it identifies the server holding the password', (_field, other) => {
    expect(isSameMailServer(config, other)).toBe(false);
  });
});

describe('default templates', () => {
  it.each(['en', 'fr'] as const)('should carry the required placeholders in %s', (language) => {
    expect(DEFAULT_NEW_USER_EMAIL_TEMPLATE.body[language]).toContain('{{username}}');
    expect(DEFAULT_ASSIGNMENT_EMAIL_TEMPLATE.body[language]).toContain('{{url}}');
    expect(DEFAULT_ASSIGNMENT_EMAIL_TEMPLATE.body[language]).toContain('{{expiresAt}}');
  });

  it.each(['en', 'fr'] as const)('should have a non-empty subject and body in %s', (language) => {
    expect(DEFAULT_NEW_USER_EMAIL_TEMPLATE.subject[language].trim()).toBeTruthy();
    expect(DEFAULT_ASSIGNMENT_EMAIL_TEMPLATE.subject[language].trim()).toBeTruthy();
  });

  // Emailing a cleartext password is the thing this flow was changed to stop doing.
  it('should not put a password in the new-user welcome email', () => {
    expect(JSON.stringify(DEFAULT_NEW_USER_EMAIL_TEMPLATE)).not.toContain('{{password}}');
  });
});
