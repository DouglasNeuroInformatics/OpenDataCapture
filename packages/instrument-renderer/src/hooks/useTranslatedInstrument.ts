import { useMemo } from 'react';

import type { InstrumentKind, SomeInstrument } from '@open-data-capture/common/instrument';
import { translateInstrument } from '@open-data-capture/instrument-utils';
import { useTranslation } from 'react-i18next';

/**
 * Translate an instrument to the user's preferred language.
 *
 * If the instrument is a unilingual instrument, it will be returned as is. Otherwise, it will
 * be translated to the user's preferred language, or, if that is not available, the first element
 * in an array of languages.
 *
 * @param instrument - the instrument to translate
 * @returns The instrument as a unilingual instrument
 */
export function useTranslatedInstrument<TKind extends InstrumentKind>(instrument: SomeInstrument<TKind> | null) {
  const { i18n } = useTranslation();
  return useMemo(() => {
    if (!instrument) {
      return null;
    }
    return translateInstrument(instrument, i18n.resolvedLanguage!);
  }, [instrument, i18n.resolvedLanguage]);
}
