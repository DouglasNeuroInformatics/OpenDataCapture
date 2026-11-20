import type { Language } from '@opendatacapture/schemas/core';
import type { TranslatedInstrumentInfo } from '@opendatacapture/schemas/instrument';

type AdministrationChoice = {
  instrument: TranslatedInstrumentInfo;
  /**
   * The language to open the instrument in. Absent means none was chosen, which a remote assignment
   * leaves to the subject's browser and the instrument offers none of the allowed languages.
   */
  language: Language | undefined;
  languageOptions: Language[];
};

type AdministrationChoiceOptions = {
  /** Narrows the instrument's own languages to those the instance has active. */
  allowedLanguages: readonly Language[];
  /** Used when the instrument offers it; otherwise the first language it does offer. */
  preferredLanguage: Language;
};

/** The languages an instrument may be opened in here: its own, narrowed to the instance's active ones. */
function getLanguageOptions(instrument: TranslatedInstrumentInfo, allowedLanguages: readonly Language[]): Language[] {
  return instrument.supportedLanguages.filter((language) => allowedLanguages.includes(language));
}

/**
 * The language a picked instrument opens in where one must be settled now, as on a showcase card
 * that opens the instrument in a single click.
 */
function getAdministrationChoice(
  instrument: TranslatedInstrumentInfo,
  { allowedLanguages, preferredLanguage }: AdministrationChoiceOptions
): AdministrationChoice {
  const languageOptions = getLanguageOptions(instrument, allowedLanguages);
  return {
    instrument,
    language: languageOptions.includes(preferredLanguage) ? preferredLanguage : languageOptions[0],
    languageOptions
  };
}

export { getAdministrationChoice, getLanguageOptions };
export type { AdministrationChoice };
