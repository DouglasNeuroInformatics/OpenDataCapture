import type { TranslateFunction, TranslationKey } from '@douglasneuroinformatics/libui/i18n';
import { describe, expect, it } from 'vitest';
import { z } from 'zod/v4';

import { $Email, $PhoneNumber, countPhoneDigits, MIN_PHONE_DIGITS } from '../validation';

const t: TranslateFunction<TranslationKey> = (arg) => (typeof arg === 'string' ? arg : (arg.en ?? ''));

const parseWith = (schema: z.ZodType<string>) => (value: string) => {
  const result = schema.safeParse(value);
  return { issues: result.error?.issues ?? [], success: result.success };
};

const parseEmail = parseWith($Email(t));
const parsePhoneNumber = parseWith($PhoneNumber(t));

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
});

describe('$PhoneNumber', () => {
  it('should accept a blank value', () => {
    expect(parsePhoneNumber('').success).toBe(true);
  });

  it('should accept a standard North American number', () => {
    expect(parsePhoneNumber('+15145551234').success).toBe(true);
  });

  it('should accept a number with spaces, dashes, and parentheses', () => {
    expect(parsePhoneNumber('(514) 555-1234').success).toBe(true);
  });

  it('should accept a number with exactly the minimum number of digits', () => {
    expect(parsePhoneNumber('12-34-567').success).toBe(true);
  });

  it('should reject a well-formed number with too few digits', () => {
    const { issues } = parsePhoneNumber('12-34-56');
    expect(issues).toHaveLength(1);
    expect(issues[0]!.message).toBe(`Phone number must contain at least ${MIN_PHONE_DIGITS} digits`);
  });

  it('should reject a malformed number with a format message', () => {
    const { issues } = parsePhoneNumber('abcdefgh');
    expect(issues).toHaveLength(1);
    expect(issues[0]!.message).toBe('Invalid phone number');
  });
});

describe('$Email', () => {
  it('should accept a blank value', () => {
    expect(parseEmail('').success).toBe(true);
  });

  it('should accept a well-formed address', () => {
    expect(parseEmail('jane.doe@example.org').success).toBe(true);
  });

  it('should reject a malformed address with a translated message', () => {
    const { issues } = parseEmail('jane.doe@');
    expect(issues).toHaveLength(1);
    expect(issues[0]!.message).toBe('Invalid email address');
  });
});
