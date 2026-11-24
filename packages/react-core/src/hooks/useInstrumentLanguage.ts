import { useState } from 'react';

import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { Language } from '@opendatacapture/schemas/core';

/**
 * The language an instrument's content renders in, how to change it, and how to hold it.
 *
 * Without a `requestedLanguage` the content follows the interface language, so switching it from
 * inside the instrument switches the whole application. A host that asks for a language — a
 * clinician administering in the subject's language — gets it for the content alone, and a switch
 * from inside the instrument then leaves the interface where it was. A host that asks for another
 * language — rendering a second instrument without unmounting the renderer — gets that one, rather
 * than keeping the first instrument's. Holding a language detaches the content from the interface
 * the same way, so an instrument that locks its language keeps it when the interface changes.
 */
export function useInstrumentLanguage(requestedLanguage?: Language): {
  changeContentLanguage: (language: Language) => void;
  contentLanguage: Language;
  holdContentLanguage: (language: Language) => void;
} {
  const { changeLanguage, resolvedLanguage } = useTranslation();
  const [heldLanguage, setHeldLanguage] = useState(requestedLanguage);
  const [requested, setRequested] = useState(requestedLanguage);

  if (requestedLanguage !== requested) {
    setRequested(requestedLanguage);
    setHeldLanguage(requestedLanguage);
  }
  if (!heldLanguage) {
    return {
      changeContentLanguage: changeLanguage,
      contentLanguage: resolvedLanguage,
      holdContentLanguage: setHeldLanguage
    };
  }
  return {
    changeContentLanguage: setHeldLanguage,
    contentLanguage: heldLanguage,
    holdContentLanguage: setHeldLanguage
  };
}
