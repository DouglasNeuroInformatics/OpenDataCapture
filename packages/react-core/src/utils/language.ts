import { LANGUAGES } from '@opendatacapture/schemas/core';
import type { Language } from '@opendatacapture/schemas/core';

/**
 * The name of every interface language, written in each interface language. The `satisfies` keeps
 * this in step with {@link Language}: a language added to the contract fails to compile until it
 * has a name to display and a name in every other language.
 *
 * Each entry is shaped for `t()`, so `t(LANGUAGE_LABELS.fr)` names French in whatever language the
 * reader is using, while `LANGUAGE_LABELS.fr.fr` is the autonym a language picker should offer.
 */
const LANGUAGE_LABELS = {
  en: { en: 'English', es: 'Inglés', fr: 'Anglais' },
  es: { en: 'Spanish', es: 'Español', fr: 'Espagnol' },
  fr: { en: 'French', es: 'Francés', fr: 'Français' }
} as const satisfies { [L in Language]: { [P in Language]: string } };

/**
 * Options for libui's `LanguageToggle`, which labels each language with its own name so a reader
 * can find their language without already being able to read the interface.
 */
const toLanguageToggleOptions = (languages: readonly Language[]): { [L in Language]?: string } =>
  Object.fromEntries(languages.map((language) => [language, LANGUAGE_LABELS[language][language]]));

export { LANGUAGE_LABELS, LANGUAGES, toLanguageToggleOptions };
