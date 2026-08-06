import { createZodErrorMaps, localizeZodErrors } from '@opendatacapture/react-core';
import { afterEach, describe, expect, it } from 'vitest';
import { z as z3 } from 'zod/v3';
import { z as z4 } from 'zod/v4';

import i18n from '@/services/i18n';

const maps = createZodErrorMaps(i18n);

// Both majors accept an error map for a single parse, so these exercise the maps without mutating
// the global registries the app configures at startup.
const v3Message = (schema: z3.ZodTypeAny, value: unknown) => {
  return schema.safeParse(value, { errorMap: maps.v3 }).error?.issues[0]?.message;
};

const v4Message = (schema: z4.ZodType, value: unknown) => {
  return schema.safeParse(value, { error: maps.v4 }).error?.issues[0]?.message;
};

const REQUIRED = 'This field is required';
const INVALID = 'The value entered is not valid';

afterEach(() => {
  i18n.changeLanguage('en');
});

describe('zod v3 error map', () => {
  it.each([
    ['a missing field is the required message', z3.object({ x: z3.string() }), {}, REQUIRED],
    ['a null value reads as missing rather than a type error', z3.object({ x: z3.string() }), { x: null }, REQUIRED],
    ['an empty string against min(1), which untouched text fields submit', z3.string().min(1), '', REQUIRED],
    [
      'an untouched union of literals, which zod would otherwise report as "Invalid input"',
      z3.object({ x: z3.union([z3.literal(1), z3.literal(2)]) }),
      {},
      REQUIRED
    ],
    ['a decimal in an integer field', z3.number().int(), 1.5, 'Must be a whole number'],
    ['a number where text is expected', z3.string(), 1, 'Must be text'],
    ['text where a number is expected', z3.number(), 'x', 'Must be a number'],
    ['text where a boolean is expected', z3.boolean(), 'x', 'Must be a valid selection'],
    ['an unparseable date', z3.date(), new Date('nope'), 'Must be a valid date'],
    ['a number below an inclusive minimum', z3.number().gte(1), 0, 'Must be 1 or greater'],
    ['a number at an exclusive minimum', z3.number().gt(1), 1, 'Must be greater than 1'],
    ['a number above an inclusive maximum', z3.number().lte(10), 12, 'Must be 10 or less'],
    ['a large bound, grouped for readability', z3.number().lte(1000000), 2000000, 'Must be 1,000,000 or less'],
    ['a string below its minimum length', z3.string().min(3), 'ab', 'Must be at least 3 characters'],
    ['a string of the wrong exact length', z3.string().length(5), 'ab', 'Must be exactly 5 characters'],
    ['a set below its minimum size', z3.set(z3.string()).min(2), new Set(['a']), 'Must select at least 2 options'],
    [
      'a single-option minimum, in the singular',
      z3.set(z3.string()).min(1),
      new Set(),
      'Must select at least 1 option'
    ],
    ['an array above its maximum size', z3.array(z3.string()).max(1), ['a', 'b'], 'Must select at most 1 option'],
    [
      'a value failing a regex, without leaking the pattern',
      z3.string().regex(/^[A-Z]$/),
      'zz',
      'Does not match the expected format'
    ],
    ['a malformed email address', z3.string().email(), 'x', 'Must be a valid email address'],
    ['a malformed url', z3.string().url(), 'x', 'Must be a valid web address'],
    ['a string missing its required prefix', z3.string().startsWith('ab'), 'zz', 'Must start with "ab"'],
    ['a value outside an enum', z3.enum(['A', 'B']), 'C', 'Must be a valid selection'],
    ['a number that is not a multiple of the divisor', z3.number().multipleOf(5), 7, 'Must be a multiple of 5'],
    [
      'a union whose branches disagree, which has no single explanation',
      z3.union([z3.string(), z3.number()]),
      true,
      INVALID
    ],
    ['an issue the map does not model', z3.number().finite(), Infinity, INVALID],
    [
      'an unexpected key, which no form field can produce',
      z3.object({ x: z3.string() }).strict(),
      { x: 'a', y: 1 },
      INVALID
    ]
  ])('should describe %s', (_, schema, value, expected) => {
    expect(v3Message(schema, value)).toBe(expected);
  });

  it('should format a date bound as a date rather than a timestamp', () => {
    expect(v3Message(z3.date().min(new Date(2020, 0, 15)), new Date(2019, 0, 1))).toBe(
      'Must be on or after January 15, 2020'
    );
  });

  it('should leave a message written by the schema author untouched', () => {
    expect(v3Message(z3.string().min(3, { message: 'Trop court' }), 'ab')).toBe('Trop court');
  });

  it('should follow the language the reader switched to, since messages are built at parse time', () => {
    i18n.changeLanguage('fr');
    expect(v3Message(z3.object({ x: z3.string() }), {})).toBe('Ce champ est obligatoire');
    expect(v3Message(z3.number().int(), 1.5)).toBe('Doit être un nombre entier');
    expect(v3Message(z3.string().min(3), 'ab')).toBe('Doit contenir au moins 3 caractères');
  });

  it('should put zero in the singular in French, where English keeps it plural', () => {
    expect(v3Message(z3.array(z3.string()).max(0), ['a'])).toBe('Must select at most 0 options');
    i18n.changeLanguage('fr');
    expect(v3Message(z3.array(z3.string()).max(0), ['a'])).toBe('Doit sélectionner au plus 0 option');
  });
});

describe('zod v4 error map', () => {
  it.each([
    ['a missing field is the required message', z4.object({ x: z4.string() }), {}, REQUIRED],
    ['a null value reads as missing rather than a type error', z4.object({ x: z4.string() }), { x: null }, REQUIRED],
    ['an empty string against min(1), which untouched text fields submit', z4.string().min(1), '', REQUIRED],
    [
      'an untouched union of literals, which zod would otherwise report as "Invalid input"',
      z4.object({ x: z4.union([z4.literal(1), z4.literal(2)]) }),
      {},
      REQUIRED
    ],
    ['a decimal in an integer field', z4.number().int(), 1.5, 'Must be a whole number'],
    ['a number where text is expected', z4.string(), 1, 'Must be text'],
    ['text where a number is expected', z4.number(), 'x', 'Must be a number'],
    ['text where a boolean is expected', z4.boolean(), 'x', 'Must be a valid selection'],
    ['a number below an inclusive minimum', z4.number().gte(1), 0, 'Must be 1 or greater'],
    ['a number at an exclusive minimum', z4.number().gt(1), 1, 'Must be greater than 1'],
    ['a number above an inclusive maximum', z4.number().lte(10), 12, 'Must be 10 or less'],
    ['a large bound, grouped for readability', z4.number().lte(1000000), 2000000, 'Must be 1,000,000 or less'],
    ['a string below its minimum length', z4.string().min(3), 'ab', 'Must be at least 3 characters'],
    ['a string of the wrong exact length', z4.string().length(5), 'ab', 'Must be exactly 5 characters'],
    ['a set below its minimum size', z4.set(z4.string()).min(2), new Set(['a']), 'Must select at least 2 options'],
    [
      'a single-option minimum, in the singular',
      z4.set(z4.string()).min(1),
      new Set(),
      'Must select at least 1 option'
    ],
    ['an array above its maximum size', z4.array(z4.string()).max(1), ['a', 'b'], 'Must select at most 1 option'],
    [
      'a value failing a regex, without leaking the pattern',
      z4.string().regex(/^[A-Z]$/),
      'zz',
      'Does not match the expected format'
    ],
    ['a malformed email address', z4.email(), 'x', 'Must be a valid email address'],
    ['a malformed url', z4.url(), 'x', 'Must be a valid web address'],
    ['a string missing its required prefix', z4.string().startsWith('ab'), 'zz', 'Must start with "ab"'],
    ['a value outside an enum', z4.enum(['A', 'B']), 'C', 'Must be a valid selection'],
    ['a number that is not a multiple of the divisor', z4.number().multipleOf(5), 7, 'Must be a multiple of 5'],
    [
      'a union whose branches disagree, which has no single explanation',
      z4.union([z4.string(), z4.number()]),
      true,
      INVALID
    ],
    [
      'an unexpected key, which no form field can produce',
      z4.strictObject({ x: z4.string() }),
      { x: 'a', y: 1 },
      INVALID
    ]
  ])('should describe %s', (_, schema, value, expected) => {
    expect(v4Message(schema, value)).toBe(expected);
  });

  it('should format a date bound as a date rather than a timestamp', () => {
    expect(v4Message(z4.date().min(new Date(2020, 0, 15)), new Date(2019, 0, 1))).toBe(
      'Must be on or after January 15, 2020'
    );
  });

  it('should leave a message written by the schema author untouched', () => {
    expect(v4Message(z4.string().min(3, { message: 'Trop court' }), 'ab')).toBe('Trop court');
  });

  it('should follow the language the reader switched to, since messages are built at parse time', () => {
    i18n.changeLanguage('fr');
    expect(v4Message(z4.object({ x: z4.string() }), {})).toBe('Ce champ est obligatoire');
    expect(v4Message(z4.number().int(), 1.5)).toBe('Doit être un nombre entier');
    expect(v4Message(z4.string().min(3), 'ab')).toBe('Doit contenir au moins 3 caractères');
  });

  it('should translate to Spanish, which the language table covers but few inline strings do', () => {
    i18n.changeLanguage('es');
    expect(v4Message(z4.object({ x: z4.string() }), {})).toBe('Este campo es obligatorio');
    expect(v4Message(z4.string().min(3), 'ab')).toBe('Debe tener al menos 3 caracteres');
  });
});

describe('localizeZodErrors', () => {
  it("should register on this bundle's zod, so app forms need no per-parse map", async () => {
    await localizeZodErrors({ targets: ['app'], translator: i18n });
    expect(z3.object({ x: z3.string() }).safeParse({}).error?.issues[0]?.message).toBe(REQUIRED);
    expect(z4.object({ x: z4.string() }).safeParse({}).error?.issues[0]?.message).toBe(REQUIRED);
  });
});
