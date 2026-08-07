import { LANGUAGE_LABELS, LANGUAGES } from '@opendatacapture/react-core';
import type { Language, LocalizedString } from '@opendatacapture/schemas/core';

/** Blank text is absent text: content authored as `''` is a language the author left empty. */
const isPresent = <TValue>(value: null | TValue | undefined): value is TValue =>
  value !== null && value !== undefined && (typeof value !== 'string' || value.trim().length > 0);

/** Content in some or all of the interface languages — a branding string, or a piece of UI copy. */
export type LocalizedValues<TValue> = { [L in Language]?: null | TValue };

/**
 * Resolve per-language content for a reader, preferring their language and otherwise falling back
 * through the remaining languages in {@link LANGUAGES} order.
 *
 * Falling back rather than returning nothing is the point: an instance that named itself only in
 * English should still show that name to a reader of Spanish, not an empty heading.
 */
export const getValueForLanguage = <TValue>(
  values: LocalizedValues<TValue>,
  preferredLanguage: Language
): TValue | undefined => [preferredLanguage, ...LANGUAGES].map((code) => values[code]).find(isPresent);

/** The languages a localized string has non-blank content in, in {@link LANGUAGES} order. */
export const authoredLanguages = (value: LocalizedString | null | undefined): Language[] =>
  LANGUAGES.filter((code) => value?.[code]?.trim());

/**
 * Keep only the languages that were actually authored. Iterating {@link LANGUAGES} rather than the
 * value's own keys is what stops anything but a known language reaching the API.
 */
export const omitBlankLanguages = (value: LocalizedString | null | undefined): LocalizedString =>
  Object.fromEntries(authoredLanguages(value).map((code) => [code, value?.[code]]));

export { LANGUAGE_LABELS, LANGUAGES };
