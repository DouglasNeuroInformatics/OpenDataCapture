import { describe, expect, it } from 'vitest';

import {
  $UpdateSubjectIdentificationSettingsData,
  compileCustomFieldPattern,
  CUSTOM_FIELDS_MAX_FIELD_COUNT
} from '../subject-identification.js';

const field = (pattern = '[A-Z]{2}[0-9]+') => ({ label: { en: 'Animal ID' }, pattern });

const update = (
  fields: { [key: string]: unknown }[],
  label: { [key: string]: unknown } = { en: 'Animal information' }
) => {
  return $UpdateSubjectIdentificationSettingsData.safeParse({ customFields: { fields, label } });
};

describe('$UpdateSubjectIdentificationSettingsData', () => {
  it('should accept a definition of labelled fields with valid patterns', () => {
    expect(update([field(), field('\\p{L}+')]).success).toBe(true);
  });

  it('should accept removing the definition', () => {
    expect($UpdateSubjectIdentificationSettingsData.safeParse({ customFields: null }).success).toBe(true);
  });

  it('should reject a definition with no field, which would give every subject the same id', () => {
    expect(update([]).success).toBe(false);
  });

  it('should reject more fields than the limit', () => {
    expect(update(Array.from({ length: CUSTOM_FIELDS_MAX_FIELD_COUNT + 1 }, () => field())).success).toBe(false);
  });

  it('should reject a pattern that does not compile', () => {
    expect(update([field('[A-Z')]).success).toBe(false);
  });

  it('should reject a pattern that compiles without the u flag but not with it, since it is tested with the flag', () => {
    expect(() => new RegExp('\\-')).not.toThrow();
    expect(update([field('\\-')]).success).toBe(false);
  });

  it('should reject a method label with no content in any language', () => {
    expect(update([field()], { en: ' ' }).success).toBe(false);
  });

  it('should reject a field label with no content in any language', () => {
    expect(update([{ label: { fr: '' }, pattern: '.+' }]).success).toBe(false);
  });

  it('should ignore a salt or iteration count sent by the client, since only the server sets them', () => {
    const result = $UpdateSubjectIdentificationSettingsData.parse({
      customFields: { fields: [field()], iterations: 1, label: { en: 'Animal information' }, salt: '00' }
    });
    expect(result.customFields).not.toHaveProperty('salt');
    expect(result.customFields).not.toHaveProperty('iterations');
  });
});

describe('compileCustomFieldPattern', () => {
  it('should match only the whole value, so a pattern cannot accept a value by matching part of it', () => {
    const pattern = compileCustomFieldPattern('[0-9]{3}');
    expect(pattern.test('123')).toBe(true);
    expect(pattern.test('A123')).toBe(false);
    expect(pattern.test('1234')).toBe(false);
  });

  it('should keep an alternation inside the anchors', () => {
    const pattern = compileCustomFieldPattern('AB|CD');
    expect(pattern.test('ABX')).toBe(false);
    expect(pattern.test('CD')).toBe(true);
  });

  it('should read Unicode property escapes', () => {
    expect(compileCustomFieldPattern('\\p{L}+').test('ÉLAN')).toBe(true);
  });
});
