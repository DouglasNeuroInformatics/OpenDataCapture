import { useState } from 'react';

import type { Language } from '@opendatacapture/schemas/core';
import type { TranslatedInstrumentInfo } from '@opendatacapture/schemas/instrument';

import { getLanguageOptions } from '@/utils/administration-choice';
import type { AdministrationChoice } from '@/utils/administration-choice';

/**
 * The language a picked instrument is assigned in. No language is chosen to begin with, which
 * leaves it to the subject's browser — the assignment is made before anyone knows what they read.
 *
 * @param allowedLanguages - narrows the instrument's own languages, e.g. to the instance's active ones
 */
export function useAdministrationChoice(allowedLanguages?: readonly Language[]) {
  const [instrument, setInstrument] = useState<null | TranslatedInstrumentInfo>(null);
  const [language, setLanguage] = useState<Language | undefined>(undefined);

  const describe = (picked: TranslatedInstrumentInfo, chosen: Language | undefined): AdministrationChoice => {
    return { instrument: picked, language: chosen, languageOptions: getLanguageOptions(picked, allowedLanguages) };
  };

  const pick = (picked: TranslatedInstrumentInfo): AdministrationChoice => {
    setInstrument(picked);
    setLanguage(undefined);
    return describe(picked, undefined);
  };

  return {
    choice: instrument ? describe(instrument, language) : null,
    pick,
    setLanguage
  };
}
