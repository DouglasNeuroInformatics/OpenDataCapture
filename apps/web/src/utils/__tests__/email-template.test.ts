import { describe, expect, it } from 'vitest';

import { checkTemplateIssue } from '../email-template';

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

  // A pristine create form has no content yet, so validation must scope to what was authored.
  it('should ignore a language the author has not started', () => {
    expect(checkTemplateIssue({ en: 'Subject' }, { en: 'Link {{url}}' }, ['url'], ['en'])).toBeNull();
  });

  it('should ignore a language untouched in both fields by default', () => {
    expect(checkTemplateIssue({ en: 'Subject' }, { en: 'Link {{url}}' }, ['url'])).toBeNull();
  });

  // A whitespace-only body must be blocked, not silently dropped at save time — dropping it sends
  // a subject in one language over a body in another.
  it('should report incomplete when a body is only whitespace in a touched language', () => {
    expect(checkTemplateIssue(subject, { en: 'Link {{url}}', fr: '   ' }, ['url'])).toBe('incomplete');
  });

  it('should report incomplete when a subject is authored without its body', () => {
    expect(checkTemplateIssue(subject, { en: 'Link {{url}}' }, ['url'])).toBe('incomplete');
  });
});
