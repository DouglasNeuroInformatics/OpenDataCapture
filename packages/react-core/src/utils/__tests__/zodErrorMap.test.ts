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

// Behaviour a form field reaches every day (required, type, size, format and union messages) is
// tested once, on the adapter side, in apps/web/src/__tests__/zod-error-maps.test.ts. These are
// the issue shapes that suite does not produce.
describe('zod v3 error map', () => {
  it.each([
    ['a missing literal as required', z3.literal(1), undefined, REQUIRED],
    ['a null literal as required', z3.literal(1), null, REQUIRED],
    ['a wrong literal as an invalid selection', z3.literal(1), 2, 'Must be a valid selection'],
    [
      'an unknown discriminator as an invalid selection',
      z3.discriminatedUnion('type', [z3.object({ type: z3.literal('a') })]),
      { type: 'b' },
      'Must be a valid selection'
    ],
    ['text where a list is expected', z3.array(z3.string()), 'x', 'Must be a list of values'],
    ['a type no form field produces as invalid', z3.symbol(), 1, INVALID],
    ['a malformed datetime as an invalid date', z3.string().datetime(), 'x', 'Must be a valid date'],
    ['a malformed time', z3.string().time(), 'x', 'Must be a valid time'],
    ['a string missing its required substring', z3.string().includes('ab'), 'zz', 'Must include "ab"'],
    ['a string missing its required suffix', z3.string().endsWith('ab'), 'zz', 'Must end with "ab"']
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
    ['a null literal as required rather than a wrong option', z4.literal(1), null, REQUIRED],
    ['a type no form field produces as invalid', z4.symbol(), 1, INVALID],
    ['a malformed iso date as an invalid date', z4.iso.date(), 'x', 'Must be a valid date'],
    ['a malformed iso datetime as an invalid date', z4.iso.datetime(), 'x', 'Must be a valid date'],
    ['a malformed iso time', z4.iso.time(), 'x', 'Must be a valid time'],
    ['a string missing its required substring', z4.string().includes('ab'), 'zz', 'Must include "ab"'],
    ['a string missing its required suffix', z4.string().endsWith('ab'), 'zz', 'Must end with "ab"'],
    ['a bigint that is not a multiple of the divisor', z4.bigint().multipleOf(5n), 7n, 'Must be a multiple of 5'],
    [
      'a date after its maximum',
      z4.date().max(JANUARY_15_2020),
      new Date(2021, 0, 1),
      'Must be on or before January 15, 2020'
    ]
  ])('should describe %s', (_, schema, value, expected) => {
    expect(v4Message(schema, value)).toBe(expected);
  });

  it('should treat null as a type error when the schema expects null itself', () => {
    expect(describeV4({ code: 'invalid_type', expected: 'null', input: null })).toBe(INVALID);
  });

  it('should describe a union with an empty branch as invalid, having no message to repeat', () => {
    expect(describeV4({ code: 'invalid_union', errors: [[]], input: 'x' })).toBe(INVALID);
  });

  it('should leave the placeholder unfilled for a hand-raised issue without an affix, which zod itself always sets', () => {
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
    try {
      const { localizeZodErrors } = await import('../zodErrorMap.js');
      return localizeZodErrors;
    } finally {
      vi.unstubAllGlobals();
    }
  };

  afterEach(() => {
    z3.setErrorMap(z3.defaultErrorMap);
    z4.config({ customError: undefined });
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it("should register in the translator's language on this bundle's zod", async () => {
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
