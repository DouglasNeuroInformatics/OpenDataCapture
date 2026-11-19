import type { Language } from '@opendatacapture/schemas/core';
import type { TranslatedInstrumentInfo } from '@opendatacapture/schemas/instrument';

type AdministrationChoice = {
  instrument: TranslatedInstrumentInfo;
  /** Absent only when the instrument offers none of the allowed languages. */
  language: Language | undefined;
  languageOptions: Language[];
};

type AdministrationChoiceOptions = {
  /** Narrows the instrument's own languages, e.g. to those the instance has active. */
  allowedLanguages?: readonly Language[];
  /** Used when the instrument offers it; otherwise the first language it does offer. */
  preferredLanguage: Language;
};

/** The language a picked instrument is administered in, and the languages it could be. */
function getAdministrationChoice(
  instrument: TranslatedInstrumentInfo,
  { allowedLanguages, preferredLanguage }: AdministrationChoiceOptions
): AdministrationChoice {
  const languageOptions: Language[] = instrument.supportedLanguages.filter(
    (language) => !allowedLanguages || allowedLanguages.includes(language)
  );
  return {
    instrument,
    language: languageOptions.includes(preferredLanguage) ? preferredLanguage : languageOptions[0],
    languageOptions
  };
}

export { getAdministrationChoice };
export type { AdministrationChoice };
