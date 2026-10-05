import { format } from '@douglasneuroinformatics/libjs';
import type { TranslateOptions, TranslationValue } from '@douglasneuroinformatics/libui/i18n';
import type { Language } from '@opendatacapture/schemas/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { z as z3 } from 'zod/v3';
import { z as z4 } from 'zod/v4';

import { createZodErrorMaps } from '../zodErrorMap.js';

import type { TranslatorLike } from '../zodErrorMap.js';

const REQUIRED = 'This field is required';
const INVALID = 'The value entered is not valid';

const createTranslator = (resolvedLanguage: Language): TranslatorLike => ({
  resolvedLanguage,
  t: (translations: TranslationValue, { args }: TranslateOptions = {}) => {
    const formatArgs = Array.isArray(args) ? args : (args?.[resolvedLanguage] ?? []);
    return format(translations[resolvedLanguage], ...formatArgs);
  }
});

const mapsFor = (language: Language) => createZodErrorMaps(createTranslator(language));

const maps = mapsFor('en');

const v3Message = (schema: z3.ZodTypeAny, value: unknown, errorMap = maps.v3) => {
  return schema.safeParse(value, { errorMap }).error?.issues[0]?.message;
};

const v4Message = (schema: z4.ZodType, value: unknown, error = maps.v4) => {
  return schema.safeParse(value, { error }).error?.issues[0]?.message;
};

const describeV3 = (issue: z3.ZodIssueOptionalMessage) => {
  return maps.v3(issue, { data: undefined, defaultError: '' }).message;
};

const describeV4 = (issue: z4.core.$ZodRawIssue) => maps.v4(issue);

const JANUARY_15_2020 = new Date(2020, 0, 15);

describe('zod v3 error map', () => {
  it.each([
    ['a missing field as required', z3.object({ x: z3.string() }), {}, REQUIRED],
    ['a null value as required rather than a type error', z3.object({ x: z3.string() }), { x: null }, REQUIRED],
    ['an empty string against min(1) as required', z3.string().min(1), '', REQUIRED],
    ['a missing literal as required', z3.literal(1), undefined, REQUIRED],
    ['a null literal as required', z3.literal(1), null, REQUIRED],
    ['a wrong literal as an invalid selection', z3.literal(1), 2, 'Must be a valid selection'],
    ['a value outside an enum as an invalid selection', z3.enum(['A', 'B']), 'C', 'Must be a valid selection'],
    [
      'an unknown discriminator as an invalid selection',
      z3.discriminatedUnion('type', [z3.object({ type: z3.literal('a') })]),
      { type: 'b' },
      'Must be a valid selection'
    ],
    ['an unparseable date as an invalid date', z3.date(), new Date('nope'), 'Must be a valid date'],
    ['a decimal in an integer field', z3.number().int(), 1.5, 'Must be a whole number'],
    ['a number where text is expected', z3.string(), 1, 'Must be text'],
    ['text where a list is expected', z3.array(z3.string()), 'x', 'Must be a list of values'],
    ['a type no form field produces as invalid', z3.symbol(), 1, INVALID],
    [
      'a regex failure without leaking the pattern',
      z3.string().regex(/^A$/),
      'B',
      'Does not match the expected format'
    ],
    ['a malformed email address', z3.string().email(), 'x', 'Must be a valid email address'],
    ['a malformed url', z3.string().url(), 'x', 'Must be a valid web address'],
    ['a malformed datetime as an invalid date', z3.string().datetime(), 'x', 'Must be a valid date'],
    ['a malformed time', z3.string().time(), 'x', 'Must be a valid time'],
    ['a string missing its required substring', z3.string().includes('ab'), 'zz', 'Must include "ab"'],
    ['a string missing its required prefix', z3.string().startsWith('ab'), 'zz', 'Must start with "ab"'],
    ['a string missing its required suffix', z3.string().endsWith('ab'), 'zz', 'Must end with "ab"'],
    ['a number that is not a multiple of the divisor', z3.number().multipleOf(5), 7, 'Must be a multiple of 5'],
    ['a number at an exclusive minimum', z3.number().gt(1), 1, 'Must be greater than 1'],
    ['a number above an inclusive maximum', z3.number().lte(1000000), 2000000, 'Must be 1,000,000 or less'],
    ['a string below its minimum length', z3.string().min(3), 'ab', 'Must be at least 3 characters'],
    ['a string of the wrong exact length', z3.string().length(1), 'ab', 'Must be exactly 1 character'],
    ['an array above its maximum size', z3.array(z3.string()).max(1), ['a', 'b'], 'Must select at most 1 option'],
    [
      'a date before its minimum',
      z3.date().min(JANUARY_15_2020),
      new Date(2019, 0, 1),
      'Must be on or after January 15, 2020'
    ],
    ['a union whose branches disagree as invalid', z3.union([z3.string(), z3.number()]), true, INVALID],
    [
      'a union whose branches agree with their shared message',
      z3.object({ x: z3.union([z3.literal(1), z3.literal(2)]) }),
      {},
      REQUIRED
    ],
    ['an issue the map does not model as invalid', z3.object({}).strict(), { y: 1 }, INVALID]
  ])('should describe %s', (_, schema, value, expected) => {
    expect(v3Message(schema, value)).toBe(expected);
  });

  it('should treat null as a type error when the schema expects null itself', () => {
    expect(describeV3({ code: 'invalid_type', expected: 'null', path: [], received: 'null' })).toBe(INVALID);
  });

  it('should describe a union with no branch issues as invalid, having no message to repeat', () => {
    expect(describeV3({ code: 'invalid_union', path: [], unionErrors: [new z3.ZodError([])] })).toBe(INVALID);
  });

  it('should describe an exact numeric size without a direction', () => {
    expect(describeV3({ code: 'too_small', exact: true, inclusive: true, minimum: 3, path: [], type: 'number' })).toBe(
      'Must be exactly 3'
    );
  });

  it('should treat a maximum without an exact flag as a bound', () => {
    expect(describeV3({ code: 'too_big', inclusive: true, maximum: 2, path: [], type: 'array' })).toBe(
      'Must select at most 2 options'
    );
  });

  it('should treat a minimum without an exact flag as a bound', () => {
    expect(describeV3({ code: 'too_small', inclusive: true, minimum: 2, path: [], type: 'array' })).toBe(
      'Must select at least 2 options'
    );
  });

  it('should describe a size issue on an undeclared type as invalid', () => {
    // @ts-expect-error - zod's declarations list every size type it emits today; this guards a newer runtime
    expect(describeV3({ code: 'too_big', inclusive: true, maximum: 2, path: [], type: 'map' })).toBe(INVALID);
  });

  it('should describe a minimum on an undeclared type as invalid', () => {
    // @ts-expect-error - zod's declarations list every size type it emits today; this guards a newer runtime
    expect(describeV3({ code: 'too_small', inclusive: true, minimum: 2, path: [], type: 'map' })).toBe(INVALID);
  });
});

describe('zod v4 error map', () => {
  it.each([
    ['a missing field as required', z4.object({ x: z4.string() }), {}, REQUIRED],
    ['a null value as required rather than a type error', z4.object({ x: z4.string() }), { x: null }, REQUIRED],
    ['a null literal as required rather than a wrong option', z4.literal(1), null, REQUIRED],
    ['an empty string against min(1) as required', z4.string().min(1), '', REQUIRED],
    ['a decimal in an integer field', z4.number().int(), 1.5, 'Must be a whole number'],
    ['text where a boolean is expected', z4.boolean(), 'x', 'Must be a valid selection'],
    ['a type no form field produces as invalid', z4.symbol(), 1, INVALID],
    ['a value outside an enum as an invalid selection', z4.enum(['A', 'B']), 'C', 'Must be a valid selection'],
    [
      'a regex failure without leaking the pattern',
      z4.string().regex(/^A$/),
      'B',
      'Does not match the expected format'
    ],
    ['a malformed email address', z4.email(), 'x', 'Must be a valid email address'],
    ['a malformed iso date as an invalid date', z4.iso.date(), 'x', 'Must be a valid date'],
    ['a malformed iso datetime as an invalid date', z4.iso.datetime(), 'x', 'Must be a valid date'],
    ['a malformed iso time', z4.iso.time(), 'x', 'Must be a valid time'],
    ['a string missing its required substring', z4.string().includes('ab'), 'zz', 'Must include "ab"'],
    ['a string missing its required prefix', z4.string().startsWith('ab'), 'zz', 'Must start with "ab"'],
    ['a string missing its required suffix', z4.string().endsWith('ab'), 'zz', 'Must end with "ab"'],
    ['a bigint that is not a multiple of the divisor', z4.bigint().multipleOf(5n), 7n, 'Must be a multiple of 5'],
    ['a number at an exclusive minimum', z4.number().gt(1), 1, 'Must be greater than 1'],
    ['a number above an inclusive maximum', z4.number().lte(10), 12, 'Must be 10 or less'],
    [
      'a set size check that omits inclusive as inclusive',
      z4.set(z4.string()).min(2),
      new Set(['a']),
      'Must select at least 2 options'
    ],
    ['a string of the wrong exact length', z4.string().length(5), 'ab', 'Must be exactly 5 characters'],
    [
      'a date after its maximum',
      z4.date().max(JANUARY_15_2020),
      new Date(2021, 0, 1),
      'Must be on or before January 15, 2020'
    ],
    ['a union whose branches disagree as invalid', z4.union([z4.string(), z4.number()]), true, INVALID],
    [
      'a union whose branches agree with their shared message',
      z4.object({ x: z4.union([z4.literal(1), z4.literal(2)]) }),
      {},
      REQUIRED
    ],
    ['an issue the map does not model as invalid', z4.strictObject({}), { y: 1 }, INVALID]
  ])('should describe %s', (_, schema, value, expected) => {
    expect(v4Message(schema, value)).toBe(expected);
  });

  it('should treat null as a type error when the schema expects null itself', () => {
    expect(describeV4({ code: 'invalid_type', expected: 'null', input: null })).toBe(INVALID);
  });

  it('should describe a union with an empty branch as invalid, having no message to repeat', () => {
    expect(describeV4({ code: 'invalid_union', errors: [[]], input: 'x' })).toBe(INVALID);
  });

  it('should omit the affix from a substring issue that does not carry one', () => {
    expect(describeV4({ code: 'invalid_format', format: 'includes', input: 'x' })).toBe('Must include "{}"');
  });

  it('should describe an exact numeric size without a direction', () => {
    expect(describeV4({ code: 'too_small', exact: true, input: 1, minimum: 3, origin: 'number' })).toBe(
      'Must be exactly 3'
    );
  });

  it('should print a bound given as a string verbatim', () => {
    // @ts-expect-error - zod declares numeric bounds, yet already emits a Date for a date bound
    expect(describeV4({ code: 'too_big', input: 11, maximum: '10', origin: 'number' })).toBe('Must be 10 or less');
  });

  it('should format a date bound given as a bigint timestamp', () => {
    const maximum = BigInt(JANUARY_15_2020.getTime());
    expect(describeV4({ code: 'too_big', inclusive: false, input: 0, maximum, origin: 'date' })).toBe(
      'Must be before January 15, 2020'
    );
  });

  it('should format a date bound given as a string', () => {
    // @ts-expect-error - zod declares numeric bounds, yet already emits a Date for a date bound
    expect(describeV4({ code: 'too_small', input: 0, minimum: '2020-01-15T12:00:00', origin: 'date' })).toBe(
      'Must be on or after January 15, 2020'
    );
  });

  it('should describe a maximum on an origin with no size wording as invalid', () => {
    expect(describeV4({ code: 'too_big', input: 1, maximum: 1, origin: 'file' })).toBe(INVALID);
  });

  it('should describe a minimum on an origin with no size wording as invalid', () => {
    expect(describeV4({ code: 'too_small', input: 1, minimum: 2, origin: 'file' })).toBe(INVALID);
  });
});

describe('createZodErrorMaps', () => {
  it("should translate into the translator's language", () => {
    expect(v4Message(z4.string().min(3), 'ab', mapsFor('es').v4)).toBe('Debe tener al menos 3 caracteres');
  });

  it('should put zero in the singular in French, where English keeps it plural', () => {
    expect(v3Message(z3.array(z3.string()).max(0), ['a'], mapsFor('fr').v3)).toBe('Doit sélectionner au plus 0 option');
  });

  it('should leave a message written by the schema author untouched', () => {
    expect(v3Message(z3.string().min(3, { message: 'Trop court' }), 'ab')).toBe('Trop court');
  });
});

describe('localizeZodErrors', () => {
  const RUNTIME_V3_URL = '/runtime/v1/zod@3.x/index.js';
  const RUNTIME_V4_URL = '/runtime/v1/zod@3.x/v4.js';

  const runtimeV3 = { z: { setErrorMap: vi.fn<(map: z3.ZodErrorMap) => void>() } };
  const runtimeV4 = { z: { config: vi.fn<(config: { customError?: z4.core.$ZodErrorMap }) => void>() } };
  const importRuntimeModule = vi.fn((url: string) => Promise.resolve(url === RUNTIME_V3_URL ? runtimeV3 : runtimeV4));

  // The module builds its runtime importer with `new Function` at load time, because a native
  // `import()` of /runtime/v1 is only resolvable in a browser host; stubbing `Function` while the
  // module loads substitutes these fake runtime modules for that import.
  const loadLocalizeZodErrors = async () => {
    vi.resetModules();
    vi.stubGlobal('Function', function FakeFunction() {
      return importRuntimeModule;
    });
    const { localizeZodErrors } = await import('../zodErrorMap.js');
    vi.unstubAllGlobals();
    return localizeZodErrors;
  };

  afterEach(() => {
    z3.setErrorMap(z3.defaultErrorMap);
    z4.config({ customError: undefined });
    vi.clearAllMocks();
  });

  it("should register on this bundle's zod, so app forms need no per-parse map", async () => {
    const localizeZodErrors = await loadLocalizeZodErrors();
    await localizeZodErrors({ targets: ['app'], translator: createTranslator('fr') });
    expect(z3.object({ x: z3.string() }).safeParse({}).error?.issues[0]?.message).toBe('Ce champ est obligatoire');
    expect(z4.object({ x: z4.string() }).safeParse({}).error?.issues[0]?.message).toBe('Ce champ est obligatoire');
  });

  it('should not import the runtime copies unless asked, since they only resolve in a browser host', async () => {
    const localizeZodErrors = await loadLocalizeZodErrors();
    await localizeZodErrors({ targets: ['app'], translator: createTranslator('en') });
    expect(importRuntimeModule).not.toHaveBeenCalled();
  });

  it('should import the runtime copies from the URLs instrument bundles use, to share their module cache', async () => {
    const localizeZodErrors = await loadLocalizeZodErrors();
    await localizeZodErrors({ targets: ['runtime'], translator: createTranslator('en') });
    expect(importRuntimeModule.mock.calls).toEqual([[RUNTIME_V3_URL], [RUNTIME_V4_URL]]);
  });

  it('should register the localized v3 map on the runtime copy', async () => {
    const localizeZodErrors = await loadLocalizeZodErrors();
    await localizeZodErrors({ targets: ['runtime'], translator: createTranslator('fr') });
    const runtimeMap = runtimeV3.z.setErrorMap.mock.calls[0]?.[0];
    expect(v3Message(z3.object({ x: z3.string() }), {}, runtimeMap)).toBe('Ce champ est obligatoire');
  });

  it('should register the localized v4 map on the runtime copy', async () => {
    const localizeZodErrors = await loadLocalizeZodErrors();
    await localizeZodErrors({ targets: ['runtime'], translator: createTranslator('fr') });
    const runtimeMap = runtimeV4.z.config.mock.calls[0]?.[0].customError;
    expect(v4Message(z4.object({ x: z4.string() }), {}, runtimeMap)).toBe('Ce champ est obligatoire');
  });

  it("should leave this bundle's zod alone when only the runtime is targeted", async () => {
    const localizeZodErrors = await loadLocalizeZodErrors();
    await localizeZodErrors({ targets: ['runtime'], translator: createTranslator('fr') });
    expect(z3.object({ x: z3.string() }).safeParse({}).error?.issues[0]?.message).toBe('Required');
  });
});
