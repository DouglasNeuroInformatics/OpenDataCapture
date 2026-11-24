import { useState } from 'react';

import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { Language } from '@opendatacapture/schemas/core';

/**
 * The language an instrument's content renders in, how to change it, and how to hold or release an
 * item lock on it.
 *
 * Without a `requestedLanguage` the content follows the interface language, so switching it from
 * inside the instrument switches the whole application. A host that asks for a language — a
 * clinician administering in the subject's language — gets it for the content alone, and a switch
 * from inside the instrument then leaves the interface where it was. A host that asks for another
 * language — rendering a second instrument without unmounting the renderer — gets that one, rather
 * than keeping the first instrument's. Holding a language detaches the content from the interface
 * while a locked instrument runs, and releasing that lock returns an unpinned series to following
 * the interface on its next item while keeping any language the host asked for.
 */
export function useInstrumentLanguage(requestedLanguage?: Language): {
  changeContentLanguage: (language: Language) => void;
  contentLanguage: Language;
  holdContentLanguage: (language: Language) => void;
  releaseContentLanguage: () => void;
} {
  const { changeLanguage, resolvedLanguage } = useTranslation();
  const [chosenLanguage, setChosenLanguage] = useState(requestedLanguage);
  const [lockedLanguage, setLockedLanguage] = useState<Language>();
  const [requested, setRequested] = useState(requestedLanguage);

  if (requestedLanguage !== requested) {
    setRequested(requestedLanguage);
    setChosenLanguage(requestedLanguage);
    setLockedLanguage(undefined);
  }
  const heldLanguage = lockedLanguage ?? chosenLanguage;
  return {
    changeContentLanguage: chosenLanguage ? setChosenLanguage : changeLanguage,
    contentLanguage: heldLanguage ?? resolvedLanguage,
    holdContentLanguage: setLockedLanguage,
    releaseContentLanguage: () => setLockedLanguage(undefined)
  };
}
