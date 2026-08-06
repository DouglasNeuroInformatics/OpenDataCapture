import type { TranslateFunction } from '@douglasneuroinformatics/libui/i18n';
import type { Language } from '@opendatacapture/schemas/core';
import { z as z3 } from 'zod/v3';
import { z as z4 } from 'zod/v4';

/**
 * The subset of libui's `i18n` singleton these maps need. Taking it as a parameter keeps
 * {@link createZodErrorMaps} pure, so it can be exercised with a stub instead of an initialized
 * translator, and lets each frontend supply its own instance.
 *
 * `TranslateFunction<never>` makes the keyed overload uncallable, leaving only `t({ en, fr, es })`.
 * That is a requirement rather than a preference: `apps/gateway` initializes i18n with
 * `translations: {}`, where a keyed lookup resolves to an empty string.
 */
type TranslatorLike = {
  resolvedLanguage: Language;
  t: TranslateFunction<never>;
};

type ZodErrorMaps = {
  v3: z3.ZodErrorMap;
  v4: z4.core.$ZodErrorMap;
};

type ZodErrorMapTarget = 'app' | 'runtime';

/**
 * The v4 issue fields these normalizers read, for two reasons neither of which `$ZodIssue` covers
 * on its own. What an error map is handed is a `$ZodRawIssue`, which intersects every issue with
 * `Record<string, any>` — so each field read off it is `any`. And `vendor/zod@3.x` pins type
 * declarations older than the zod it resolves at runtime: `exact` (set by `length`) and the
 * `prefix` / `suffix` / `includes` of a string-format issue are emitted but not declared.
 */
type V4Issue = z4.core.$ZodIssue & {
  exact?: boolean;
  includes?: string;
  prefix?: string;
  suffix?: string;
};

type FormatKind = 'date' | 'email' | 'endsWith' | 'includes' | 'pattern' | 'startsWith' | 'time' | 'url';

type SizeOrigin = 'characters' | 'date' | 'items' | 'number';

type TypeKind = 'boolean' | 'date' | 'integer' | 'list' | 'number' | 'text';

/**
 * A zod issue reduced to what a message depends on. zod v3 and v4 disagree on nearly every field
 * name — `received`/`input`, `type`/`origin`, `invalid_string`/`invalid_format`,
 * `invalid_enum_value`/`invalid_value` — so each major gets a normalizer and both share one
 * describer, rather than the message copy being written twice.
 */
type FormIssue =
  | {
      bound: 'max' | 'min';
      exact: boolean;
      inclusive: boolean;
      kind: 'size';
      limit: bigint | number | string;
      origin: SizeOrigin;
    }
  | { divisor: bigint | number; kind: 'multipleOf' }
  | { expected: TypeKind; kind: 'type' }
  | { format: FormatKind; kind: 'format'; value?: string }
  | { kind: 'invalid' }
  | { kind: 'option' }
  | { kind: 'required' }
  | { kind: 'union'; messages: (string | undefined)[] };

/**
 * Messages whose wording does not depend on a count. The `satisfies` keeps this in step with
 * {@link Language}: adding an interface language fails to compile until every message has one,
 * rather than silently falling back to English at runtime.
 *
 * `{}` is libui's interpolation placeholder, filled left to right from the `args` array.
 */
const MESSAGES = {
  exactNumber: { en: 'Must be exactly {}', es: 'Debe ser exactamente {}', fr: 'Doit être exactement {}' },
  formatEmail: {
    en: 'Must be a valid email address',
    es: 'Debe ser un correo electrónico válido',
    fr: 'Doit être une adresse courriel valide'
  },
  formatEndsWith: { en: 'Must end with "{}"', es: 'Debe terminar con «{}»', fr: 'Doit se terminer par « {} »' },
  formatIncludes: { en: 'Must include "{}"', es: 'Debe incluir «{}»', fr: 'Doit contenir « {} »' },
  formatPattern: {
    en: 'Does not match the expected format',
    es: 'No coincide con el formato esperado',
    fr: 'Ne correspond pas au format attendu'
  },
  formatStartsWith: { en: 'Must start with "{}"', es: 'Debe comenzar con «{}»', fr: 'Doit commencer par « {} »' },
  formatTime: { en: 'Must be a valid time', es: 'Debe ser una hora válida', fr: 'Doit être une heure valide' },
  formatUrl: {
    en: 'Must be a valid web address',
    es: 'Debe ser una dirección web válida',
    fr: 'Doit être une adresse web valide'
  },
  invalid: {
    en: 'The value entered is not valid',
    es: 'El valor introducido no es válido',
    fr: "La valeur saisie n'est pas valide"
  },
  maxDate: { en: 'Must be on or before {}', es: 'Debe ser el {} o anterior', fr: 'Doit être le {} ou avant' },
  maxDateExclusive: { en: 'Must be before {}', es: 'Debe ser anterior al {}', fr: 'Doit être avant le {}' },
  maxNumber: { en: 'Must be {} or less', es: 'Debe ser {} o menor', fr: 'Doit être inférieur ou égal à {}' },
  maxNumberExclusive: { en: 'Must be less than {}', es: 'Debe ser menor que {}', fr: 'Doit être inférieur à {}' },
  minDate: { en: 'Must be on or after {}', es: 'Debe ser el {} o posterior', fr: 'Doit être le {} ou après' },
  minDateExclusive: { en: 'Must be after {}', es: 'Debe ser posterior al {}', fr: 'Doit être après le {}' },
  minNumber: { en: 'Must be {} or greater', es: 'Debe ser {} o mayor', fr: 'Doit être supérieur ou égal à {}' },
  minNumberExclusive: { en: 'Must be greater than {}', es: 'Debe ser mayor que {}', fr: 'Doit être supérieur à {}' },
  multipleOf: { en: 'Must be a multiple of {}', es: 'Debe ser un múltiplo de {}', fr: 'Doit être un multiple de {}' },
  option: {
    en: 'Must be a valid selection',
    es: 'Debe ser una selección válida',
    fr: 'Doit être une sélection valide'
  },
  required: { en: 'This field is required', es: 'Este campo es obligatorio', fr: 'Ce champ est obligatoire' },
  typeBoolean: {
    en: 'Must be a valid selection',
    es: 'Debe ser una selección válida',
    fr: 'Doit être une sélection valide'
  },
  typeDate: { en: 'Must be a valid date', es: 'Debe ser una fecha válida', fr: 'Doit être une date valide' },
  typeInteger: { en: 'Must be a whole number', es: 'Debe ser un número entero', fr: 'Doit être un nombre entier' },
  typeList: {
    en: 'Must be a list of values',
    es: 'Debe ser una lista de valores',
    fr: 'Doit être une liste de valeurs'
  },
  typeNumber: { en: 'Must be a number', es: 'Debe ser un número', fr: 'Doit être un nombre' },
  typeText: { en: 'Must be text', es: 'Debe ser texto', fr: 'Doit être du texte' }
} as const satisfies { [key: string]: { [L in Language]: string } };

/**
 * Messages that interpolate a count, and so need a singular form. French puts zero in the singular
 * where English and Spanish do not, which is why the form is chosen by `Intl.PluralRules` against
 * the reader's language rather than by comparing the count to one.
 */
const COUNTED_MESSAGES = {
  exactCharacters: {
    one: {
      en: 'Must be exactly {} character',
      es: 'Debe tener exactamente {} carácter',
      fr: 'Doit contenir exactement {} caractère'
    },
    other: {
      en: 'Must be exactly {} characters',
      es: 'Debe tener exactamente {} caracteres',
      fr: 'Doit contenir exactement {} caractères'
    }
  },
  exactItems: {
    one: {
      en: 'Must select exactly {} option',
      es: 'Debe seleccionar exactamente {} opción',
      fr: 'Doit sélectionner exactement {} option'
    },
    other: {
      en: 'Must select exactly {} options',
      es: 'Debe seleccionar exactamente {} opciones',
      fr: 'Doit sélectionner exactement {} options'
    }
  },
  maxCharacters: {
    one: {
      en: 'Must be at most {} character',
      es: 'Debe tener como máximo {} carácter',
      fr: 'Doit contenir au plus {} caractère'
    },
    other: {
      en: 'Must be at most {} characters',
      es: 'Debe tener como máximo {} caracteres',
      fr: 'Doit contenir au plus {} caractères'
    }
  },
  maxItems: {
    one: {
      en: 'Must select at most {} option',
      es: 'Debe seleccionar como máximo {} opción',
      fr: 'Doit sélectionner au plus {} option'
    },
    other: {
      en: 'Must select at most {} options',
      es: 'Debe seleccionar como máximo {} opciones',
      fr: 'Doit sélectionner au plus {} options'
    }
  },
  minCharacters: {
    one: {
      en: 'Must be at least {} character',
      es: 'Debe tener al menos {} carácter',
      fr: 'Doit contenir au moins {} caractère'
    },
    other: {
      en: 'Must be at least {} characters',
      es: 'Debe tener al menos {} caracteres',
      fr: 'Doit contenir au moins {} caractères'
    }
  },
  minItems: {
    one: {
      en: 'Must select at least {} option',
      es: 'Debe seleccionar al menos {} opción',
      fr: 'Doit sélectionner au moins {} option'
    },
    other: {
      en: 'Must select at least {} options',
      es: 'Debe seleccionar al menos {} opciones',
      fr: 'Doit sélectionner au moins {} options'
    }
  }
} as const satisfies { [key: string]: { [F in 'one' | 'other']: { [L in Language]: string } } };

const V3_TYPE_KINDS: { [key: string]: TypeKind } = {
  array: 'list',
  bigint: 'number',
  boolean: 'boolean',
  date: 'date',
  float: 'number',
  integer: 'integer',
  map: 'list',
  nan: 'number',
  number: 'number',
  set: 'list',
  string: 'text'
};

const V4_TYPE_KINDS: { [key: string]: TypeKind } = {
  array: 'list',
  bigint: 'number',
  boolean: 'boolean',
  date: 'date',
  int: 'integer',
  map: 'list',
  number: 'number',
  set: 'list',
  string: 'text',
  tuple: 'list'
};

const V3_SIZE_ORIGINS: { [key: string]: SizeOrigin } = {
  array: 'items',
  bigint: 'number',
  date: 'date',
  number: 'number',
  set: 'items',
  string: 'characters'
};

const V4_SIZE_ORIGINS: { [key: string]: SizeOrigin } = {
  array: 'items',
  bigint: 'number',
  date: 'date',
  int: 'number',
  number: 'number',
  set: 'items',
  string: 'characters'
};

/**
 * Every string format either gets its own message or falls back to `formatPattern`. That fallback
 * is deliberate for `regex`: zod's own message interpolates the pattern, which is meaningless to a
 * clinician and leaks the schema into the interface.
 */
const FORMAT_KINDS: { [key: string]: FormatKind } = {
  date: 'date',
  datetime: 'date',
  email: 'email',
  ends_with: 'endsWith',
  includes: 'includes',
  starts_with: 'startsWith',
  time: 'time',
  url: 'url'
};

const FORMAT_MESSAGE_KEYS = {
  date: 'typeDate',
  email: 'formatEmail',
  endsWith: 'formatEndsWith',
  includes: 'formatIncludes',
  pattern: 'formatPattern',
  startsWith: 'formatStartsWith',
  time: 'formatTime',
  url: 'formatUrl'
} as const satisfies { [K in FormatKind]: keyof typeof MESSAGES };

const TYPE_MESSAGE_KEYS = {
  boolean: 'typeBoolean',
  date: 'typeDate',
  integer: 'typeInteger',
  list: 'typeList',
  number: 'typeNumber',
  text: 'typeText'
} as const satisfies { [K in TypeKind]: keyof typeof MESSAGES };

const BOUND_MESSAGE_KEYS = {
  date: {
    exclusive: { max: 'maxDateExclusive', min: 'minDateExclusive' },
    inclusive: { max: 'maxDate', min: 'minDate' }
  },
  number: {
    exclusive: { max: 'maxNumberExclusive', min: 'minNumberExclusive' },
    inclusive: { max: 'maxNumber', min: 'minNumber' }
  }
} as const satisfies {
  [O in 'date' | 'number']: { [I in 'exclusive' | 'inclusive']: { [B in 'max' | 'min']: keyof typeof MESSAGES } };
};

const formatNumber = (language: Language, value: bigint | number | string): string => {
  return typeof value === 'string' ? value : value.toLocaleString(language);
};

const formatDate = (language: Language, value: bigint | number | string): string => {
  return new Date(typeof value === 'bigint' ? Number(value) : value).toLocaleDateString(language, {
    dateStyle: 'long'
  });
};

const describeIssue = (issue: FormIssue, translator: TranslatorLike): string => {
  const language = translator.resolvedLanguage;
  const translate = (key: keyof typeof MESSAGES, args?: string[]) => translator.t(MESSAGES[key], { args });

  switch (issue.kind) {
    case 'format':
      return translate(FORMAT_MESSAGE_KEYS[issue.format], issue.value === undefined ? undefined : [issue.value]);
    case 'multipleOf':
      return translate('multipleOf', [formatNumber(language, issue.divisor)]);
    case 'option':
      return translate('option');
    case 'required':
      return translate('required');
    case 'size': {
      if (issue.origin === 'characters' || issue.origin === 'items') {
        const noun = issue.origin === 'characters' ? 'Characters' : 'Items';
        const count = Number(issue.limit);
        const plural = new Intl.PluralRules(language).select(count) === 'one' ? 'one' : 'other';
        return translator.t(COUNTED_MESSAGES[`${issue.exact ? 'exact' : issue.bound}${noun}`][plural], {
          args: [formatNumber(language, count)]
        });
      } else if (issue.origin === 'number' && issue.exact) {
        return translate('exactNumber', [formatNumber(language, issue.limit)]);
      }
      const key = BOUND_MESSAGE_KEYS[issue.origin][issue.inclusive ? 'inclusive' : 'exclusive'][issue.bound];
      const value = issue.origin === 'date' ? formatDate(language, issue.limit) : formatNumber(language, issue.limit);
      return translate(key, [value]);
    }
    case 'type':
      return translate(TYPE_MESSAGE_KEYS[issue.expected]);
    case 'union': {
      // Every branch has already been through this map, so its message is the localized one. When
      // the branches agree the union is really one failure reported N times — most often an
      // untouched `z.union([z.literal(1), ...])` radio, where each branch reports "required".
      const [first, ...rest] = issue.messages;
      return first !== undefined && rest.every((message) => message === first) ? first : translate('invalid');
    }
    default:
      return translate('invalid');
  }
};

const toFormatIssue = (
  format: string,
  affix: { endsWith?: unknown; includes?: unknown; startsWith?: unknown }
): FormIssue => {
  const kind = FORMAT_KINDS[format] ?? 'pattern';
  const value = kind === 'endsWith' || kind === 'includes' || kind === 'startsWith' ? affix[kind] : undefined;
  return { format: kind, kind: 'format', value: typeof value === 'string' ? value : undefined };
};

const normalizeV3Issue = (issue: z3.ZodIssueOptionalMessage): FormIssue => {
  switch (issue.code) {
    case 'invalid_date':
      return { expected: 'date', kind: 'type' };
    case 'invalid_enum_value':
    case 'invalid_union_discriminator':
      return { kind: 'option' };
    case 'invalid_literal':
      return issue.received === undefined || issue.received === null ? { kind: 'required' } : { kind: 'option' };
    case 'invalid_string': {
      if (typeof issue.validation === 'string') {
        return toFormatIssue(issue.validation, {});
      } else if ('includes' in issue.validation) {
        return toFormatIssue('includes', { includes: issue.validation.includes });
      } else if ('startsWith' in issue.validation) {
        return toFormatIssue('starts_with', { startsWith: issue.validation.startsWith });
      }
      return toFormatIssue('ends_with', { endsWith: issue.validation.endsWith });
    }
    case 'invalid_type': {
      if (issue.received === 'undefined' || (issue.received === 'null' && issue.expected !== 'null')) {
        return { kind: 'required' };
      }
      const expected = V3_TYPE_KINDS[issue.expected];
      return expected ? { expected, kind: 'type' } : { kind: 'invalid' };
    }
    case 'invalid_union':
      return { kind: 'union', messages: issue.unionErrors.map((error) => error.issues[0]?.message) };
    case 'not_multiple_of':
      return { divisor: issue.multipleOf, kind: 'multipleOf' };
    case 'too_big': {
      const origin = V3_SIZE_ORIGINS[issue.type];
      return origin
        ? {
            bound: 'max',
            exact: issue.exact ?? false,
            inclusive: issue.inclusive,
            kind: 'size',
            limit: issue.maximum,
            origin
          }
        : { kind: 'invalid' };
    }
    case 'too_small': {
      // An untouched text field submits '', which every `min(1)` rejects. Reporting that as a
      // length problem rather than a missing value would be true but useless.
      if (issue.type === 'string' && issue.minimum === 1) {
        return { kind: 'required' };
      }
      const origin = V3_SIZE_ORIGINS[issue.type];
      return origin
        ? {
            bound: 'min',
            exact: issue.exact ?? false,
            inclusive: issue.inclusive,
            kind: 'size',
            limit: issue.minimum,
            origin
          }
        : { kind: 'invalid' };
    }
    default:
      return { kind: 'invalid' };
  }
};

const normalizeV4Issue = (raw: z4.core.$ZodRawIssue): FormIssue => {
  const issue = raw as V4Issue;

  // Unlike v3, every issue raised while parsing carries the offending value, so one check covers a
  // missing field of any type. `'input' in issue` guards against an issue pushed by hand from a
  // `.check()` without one, which is not a missing value.
  if ('input' in issue && issue.input === undefined) {
    return { kind: 'required' };
  } else if (
    'input' in issue &&
    issue.input === null &&
    !(issue.code === 'invalid_type' && issue.expected === 'null')
  ) {
    return { kind: 'required' };
  }

  switch (issue.code) {
    case 'invalid_format':
      return toFormatIssue(issue.format, {
        endsWith: issue.suffix,
        includes: issue.includes,
        startsWith: issue.prefix
      });
    case 'invalid_type': {
      const expected = V4_TYPE_KINDS[issue.expected];
      return expected ? { expected, kind: 'type' } : { kind: 'invalid' };
    }
    case 'invalid_union':
      return { kind: 'union', messages: issue.errors.map((branch) => branch[0]?.message) };
    case 'invalid_value':
      return { kind: 'option' };
    case 'not_multiple_of':
      return { divisor: issue.divisor, kind: 'multipleOf' };
    case 'too_big': {
      const origin = V4_SIZE_ORIGINS[issue.origin];
      return origin
        ? {
            bound: 'max',
            exact: issue.exact ?? false,
            // zod omits `inclusive` on some size checks (`z.set().min(n)`) where the bound is
            // nonetheless inclusive; it is only ever explicitly false for `gt`/`lt`.
            inclusive: issue.inclusive ?? true,
            kind: 'size',
            limit: issue.maximum,
            origin
          }
        : { kind: 'invalid' };
    }
    case 'too_small': {
      if (issue.origin === 'string' && issue.minimum === 1) {
        return { kind: 'required' };
      }
      const origin = V4_SIZE_ORIGINS[issue.origin];
      return origin
        ? {
            bound: 'min',
            exact: issue.exact ?? false,
            inclusive: issue.inclusive ?? true,
            kind: 'size',
            limit: issue.minimum,
            origin
          }
        : { kind: 'invalid' };
    }
    default:
      return { kind: 'invalid' };
  }
};

/**
 * Builds the error maps both zod majors expect. Pure — it registers nothing, needs no zod instance
 * and no initialized translator, so it can be tested against a stub translator.
 *
 * The v4 map returns a string for every issue rather than `undefined` for the ones it does not
 * recognize. Returning `undefined` would defer to `config.localeError`, which the runtime bundle
 * sets to zod's English locale at module init.
 */
const createZodErrorMaps = (translator: TranslatorLike): ZodErrorMaps => ({
  v3: (issue) => ({ message: describeIssue(normalizeV3Issue(issue), translator) }),
  v4: (issue) => describeIssue(normalizeV4Issue(issue), translator)
});

// Vite rewrites every import() it can see — in dev it appends ?import to the URL — which would
// load a second copy of the runtime module under a different URL and configure the wrong one.
// Constructing the import inside a Function hides it from vite, so the URL resolves exactly the
// way it does inside an instrument bundle (whose code is evaluated the same way).
const importRuntimeModule = new Function('url', 'return import(url)') as <TModule>(url: string) => Promise<TModule>;

/**
 * Registers the maps on the zod instances named by `targets`.
 *
 * `'app'` is the copy bundled into the calling frontend, which backs its own forms. `'runtime'` is
 * the copy instrument bundles reach with a native browser `import('/runtime/v1/zod@3.x/...')` — a
 * different module instance with its own error registry, so configuring the bundled copy does
 * nothing for instrument validation schemas. Importing the same URLs the bundles use shares the
 * browser's module cache with them. Within each, v3 and v4 keep separate registries.
 *
 * `'runtime'` only resolves in a browser, and only in a host that installs the runtime Vite plugin.
 * The `'app'` registration happens before the first await, so it is in place synchronously.
 */
const localizeZodErrors = async ({
  targets,
  translator
}: {
  targets: readonly ZodErrorMapTarget[];
  translator: TranslatorLike;
}): Promise<void> => {
  const maps = createZodErrorMaps(translator);
  if (targets.includes('app')) {
    z3.setErrorMap(maps.v3);
    z4.config({ customError: maps.v4 });
  }
  if (!targets.includes('runtime')) {
    return;
  }
  const [runtimeV3, runtimeV4] = await Promise.all([
    importRuntimeModule<typeof import('/runtime/v1/zod@3.x/index.js')>('/runtime/v1/zod@3.x/index.js'),
    importRuntimeModule<typeof import('/runtime/v1/zod@3.x/v4.js')>('/runtime/v1/zod@3.x/v4.js')
  ]);
  runtimeV3.z.setErrorMap(maps.v3);
  runtimeV4.z.config({ customError: maps.v4 });
};

export { createZodErrorMaps, localizeZodErrors };
export type { TranslatorLike, ZodErrorMaps, ZodErrorMapTarget };
