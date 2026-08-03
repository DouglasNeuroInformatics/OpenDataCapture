import { describe, expect, it } from 'vitest';

import { $GroupEmailTemplate } from './group.js';

const template = {
  body: { en: 'Hello {{url}}' },
  id: 'tpl-1',
  name: 'My Template',
  subject: { en: 'Your assignment' }
};

// The send path substitutes the built-in default for a template it cannot render, so a stored
// template without content becomes a silent substitution — the rejects here are the point.
describe('$GroupEmailTemplate', () => {
  it('should accept a template authored in a single language', () => {
    expect($GroupEmailTemplate.safeParse(template).success).toBe(true);
  });

  it.each(['body', 'subject'])('should reject a template whose %s has no languages at all', (field) => {
    expect($GroupEmailTemplate.safeParse({ ...template, [field]: {} }).success).toBe(false);
  });

  it.each(['body', 'subject'])('should reject a template whose %s is blank in every language', (field) => {
    expect($GroupEmailTemplate.safeParse({ ...template, [field]: { en: '  ', fr: '' } }).success).toBe(false);
  });

  it.each(['body', 'subject'])('should reject a template with no %s', (field) => {
    expect($GroupEmailTemplate.safeParse({ ...template, [field]: undefined }).success).toBe(false);
    expect($GroupEmailTemplate.safeParse({ ...template, [field]: null }).success).toBe(false);
  });
});
