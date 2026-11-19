import { useState } from 'react';

import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { Language } from '@opendatacapture/schemas/core';

/**
 * The language an instrument's content renders in, and how to change it.
 *
 * Without a `requestedLanguage` the content follows the interface language, so switching it from
 * inside the instrument switches the whole application. A host that asks for a language — a
 * clinician administering in the subject's language — gets it for the content alone, and a switch
 * from inside the instrument then leaves the interface where it was. A host that asks for another
 * language — rendering a second instrument without unmounting the renderer — gets that one, rather
 * than keeping the first instrument's.
 */
export function useInstrumentLanguage(requestedLanguage?: Language): [Language, (language: Language) => void] {
  const { changeLanguage, resolvedLanguage } = useTranslation();
  const [contentLanguage, setContentLanguage] = useState(requestedLanguage);
  const [requested, setRequested] = useState(requestedLanguage);

  if (requestedLanguage !== requested) {
    setRequested(requestedLanguage);
    setContentLanguage(requestedLanguage);
  }
  if (!contentLanguage) {
    return [resolvedLanguage, changeLanguage];
  }
  return [contentLanguage, setContentLanguage];
}
