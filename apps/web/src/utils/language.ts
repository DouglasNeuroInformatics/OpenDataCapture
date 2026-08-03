import type { Language, LocalizedString } from '@opendatacapture/schemas/core';

/**
 * The `satisfies` keeps this in step with {@link Language}: adding a language fails to compile
 * until it is named here, which is also what supplies the ordered list of authorable languages.
 */
export const LANGUAGE_LABELS = {
  en: { en: 'English', fr: 'Anglais' },
  fr: { en: 'French', fr: 'Français' }
} as const satisfies { [L in Language]: { en: string; fr: string } };

export const LANGUAGES = Object.keys(LANGUAGE_LABELS) as Language[];

/** The languages a localized string has non-blank content in, in {@link LANGUAGES} order. */
export const authoredLanguages = (value: LocalizedString | null | undefined): Language[] =>
  LANGUAGES.filter((code) => value?.[code]?.trim());

/**
 * Keep only the languages that were actually authored. Iterating {@link LANGUAGES} rather than the
 * value's own keys is what stops anything but a known language reaching the API.
 */
export const omitBlankLanguages = (value: LocalizedString | null | undefined): LocalizedString =>
  Object.fromEntries(authoredLanguages(value).map((code) => [code, value?.[code]]));
