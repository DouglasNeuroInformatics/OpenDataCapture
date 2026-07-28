import type { TranslateFunction, TranslationKey } from '@douglasneuroinformatics/libui/i18n';
import { MIN_PHONE_DIGITS } from '@opendatacapture/schemas/user';
import { describe, expect, it } from 'vitest';
import { z } from 'zod/v4';

import { $Email, $PhoneNumber, clearedIfBlank, omittedIfBlank } from '../validation';

const t: TranslateFunction<TranslationKey> = (arg) => (typeof arg === 'string' ? arg : (arg.en ?? ''));

const parseWith = (schema: z.ZodType<string>) => (value: string) => {
  const result = schema.safeParse(value);
  return { issues: result.error?.issues ?? [], success: result.success };
};

const parseEmail = parseWith($Email(t));
const parsePhoneNumber = parseWith($PhoneNumber(t));

describe('clearedIfBlank', () => {
  it('should map a blank value to null, so an update clears the field', () => {
    expect(clearedIfBlank('')).toBeNull();
  });

  it('should leave a filled value untouched', () => {
    expect(clearedIfBlank('jane.doe@example.org')).toBe('jane.doe@example.org');
  });
});

describe('omittedIfBlank', () => {
  it('should map a blank value to undefined, since a create has nothing to clear', () => {
    expect(omittedIfBlank('')).toBeUndefined();
  });

  it('should leave a filled value untouched', () => {
    expect(omittedIfBlank('jane.doe@example.org')).toBe('jane.doe@example.org');
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
