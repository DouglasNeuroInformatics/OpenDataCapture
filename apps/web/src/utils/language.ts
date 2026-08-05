import { i18n } from '@douglasneuroinformatics/libui/i18n';
import { LANGUAGE_LABELS, LANGUAGES } from '@opendatacapture/react-core';
import { resolveActiveLanguage } from '@opendatacapture/schemas/core';
import type { ActiveLanguages, Language, LocalizedString } from '@opendatacapture/schemas/core';

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

/**
 * Move a reader off a language their instance no longer offers, and report whether it moved them.
 *
 * Called before the app renders rather than from a component: `changeLanguage` notifies only the
 * components already subscribed, libui's `useTranslation` subscribes in an effect, and effects run
 * child-first — so a correction made after mount never reaches the ancestors of whatever made it.
 * The sidebar renders the language toggle, so the sidebar is what a late correction leaves behind.
 */
export const reconcileInterfaceLanguage = (activeLanguages: ActiveLanguages): boolean => {
  const language = resolveActiveLanguage(i18n.resolvedLanguage, activeLanguages);
  if (language === i18n.resolvedLanguage) {
    return false;
  }
  i18n.changeLanguage(language);
  return true;
};

export { LANGUAGE_LABELS, LANGUAGES };
