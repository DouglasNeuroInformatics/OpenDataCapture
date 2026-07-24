import { describe, expect, it } from 'vitest';

import { countPhoneDigits, MIN_PHONE_DIGITS, PHONE_REGEX } from '../validation';

describe('countPhoneDigits', () => {
  it('should count only numeric characters', () => {
    expect(countPhoneDigits('+1 (514) 555-1234')).toBe(11);
  });

  it('should return 0 for an empty string', () => {
    expect(countPhoneDigits('')).toBe(0);
  });

  it('should ignore dashes, spaces, and parentheses', () => {
    expect(countPhoneDigits('(555) 123-4567')).toBe(10);
  });

  it('should count digits in a plain numeric string', () => {
    expect(countPhoneDigits('5551234')).toBe(7);
  });
});

describe('PHONE_REGEX', () => {
  it('should accept a standard North American number', () => {
    expect(PHONE_REGEX.test('+15145551234')).toBe(true);
  });

  it('should accept a number with spaces and dashes', () => {
    expect(PHONE_REGEX.test('514-555-1234')).toBe(true);
  });

  it('should accept a number with parentheses', () => {
    expect(PHONE_REGEX.test('(514) 555-1234')).toBe(true);
  });

  it('should reject a string with fewer than 5 characters', () => {
    expect(PHONE_REGEX.test('1234')).toBe(false);
  });

  it('should reject a purely alphabetic string', () => {
    expect(PHONE_REGEX.test('abcdefgh')).toBe(false);
  });
});

describe('MIN_PHONE_DIGITS', () => {
  it('should be 7', () => {
    expect(MIN_PHONE_DIGITS).toBe(7);
  });
});
