import { describe, expect, it } from 'vitest';

import {
  $MailConfig,
  $MailConfigDto,
  $UpdateMailConfigData,
  checkTemplateIssue,
  DEFAULT_ASSIGNMENT_EMAIL_TEMPLATE,
  DEFAULT_NEW_USER_EMAIL_TEMPLATE,
  isMailEnabled
} from './mail.js';

const config = {
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

describe('checkTemplateIssue', () => {
  const subject = { en: 'Subject', fr: 'Objet' };
  const body = { en: 'Link {{url}}', fr: 'Lien {{url}}' };

  it('should report no issue when every authored language is complete', () => {
    expect(checkTemplateIssue(subject, body, ['url'])).toBeNull();
  });

  it('should report incomplete when a language has a body but no subject', () => {
    expect(checkTemplateIssue({ en: 'Subject' }, body, ['url'], ['en', 'fr'])).toBe('incomplete');
  });

  it('should report incomplete when a subject is only whitespace', () => {
    expect(checkTemplateIssue({ en: '   ' }, { en: 'Link {{url}}' }, ['url'], ['en'])).toBe('incomplete');
  });

  it('should report missing-vars when a required placeholder is absent', () => {
    expect(checkTemplateIssue(subject, { en: 'No link here', fr: 'Lien {{url}}' }, ['url'], ['en'])).toBe(
      'missing-vars'
    );
  });

  it('should tolerate whitespace inside a placeholder', () => {
    expect(checkTemplateIssue({ en: 'Subject' }, { en: 'Link {{ url }}' }, ['url'], ['en'])).toBeNull();
  });

  it('should report incomplete when nothing has been authored at all', () => {
    expect(checkTemplateIssue({}, {}, ['url'])).toBe('incomplete');
  });
});

describe('default templates', () => {
  it('should satisfy their own required variables', () => {
    expect(
      checkTemplateIssue(DEFAULT_NEW_USER_EMAIL_TEMPLATE.subject, DEFAULT_NEW_USER_EMAIL_TEMPLATE.body, ['username'])
    ).toBeNull();
    expect(
      checkTemplateIssue(DEFAULT_ASSIGNMENT_EMAIL_TEMPLATE.subject, DEFAULT_ASSIGNMENT_EMAIL_TEMPLATE.body, [
        'url',
        'expiresAt'
      ])
    ).toBeNull();
  });

  // Emailing a cleartext password is the thing this flow was changed to stop doing.
  it('should not put a password in the new-user welcome email', () => {
    expect(JSON.stringify(DEFAULT_NEW_USER_EMAIL_TEMPLATE)).not.toContain('{{password}}');
  });
});
