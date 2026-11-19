import { useState } from 'react';

import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { Language } from '@opendatacapture/schemas/core';
import type { TranslatedInstrumentInfo } from '@opendatacapture/schemas/instrument';

import { getAdministrationChoice } from '@/utils/administration-choice';
import type { AdministrationChoice } from '@/utils/administration-choice';

/**
 * The language a picked instrument is administered in. Picking an instrument starts at the interface
 * language, falling back as {@link getAdministrationChoice} does.
 *
 * @param allowedLanguages - narrows the instrument's own languages, e.g. to the instance's active ones
 */
export function useAdministrationChoice(allowedLanguages?: readonly Language[]) {
  const { resolvedLanguage } = useTranslation();
  const [instrument, setInstrument] = useState<null | TranslatedInstrumentInfo>(null);
  const [preferredLanguage, setLanguage] = useState<Language>(resolvedLanguage);

  const describe = (picked: TranslatedInstrumentInfo, preferred: Language): AdministrationChoice => {
    return getAdministrationChoice(picked, { allowedLanguages, preferredLanguage: preferred });
  };

  const pick = (picked: TranslatedInstrumentInfo): AdministrationChoice => {
    setInstrument(picked);
    setLanguage(resolvedLanguage);
    return describe(picked, resolvedLanguage);
  };

  return {
    choice: instrument ? describe(instrument, preferredLanguage) : null,
    pick,
    setLanguage
  };
}
