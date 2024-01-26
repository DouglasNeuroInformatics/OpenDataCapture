import { useEffect, useMemo, useState } from 'react';

import type { AnyInstrument, AnyUnilingualInstrument } from '@open-data-capture/common/instrument';
import { InstrumentInterpreter } from '@open-data-capture/instrument-interpreter';
import { translateInstrument } from '@open-data-capture/instrument-utils';
import { useTranslation } from 'react-i18next';

export type InterpretedInstrumentState =
  | { instrument: AnyUnilingualInstrument; status: 'DONE' }
  | { message: string; status: 'ERROR' }
  | { status: 'LOADING' };

/**
 * Interpret an instrument bundle directly in the browser
 *
 * @param bundle - the JavaScript code to be interpreted directly in the browser
 * @returns The instrument generated from the code, translated into the current locale, if possible, otherwise the default
 */
export function useInterpretedInstrument(bundle: string) {
  const interpreter = useMemo(() => new InstrumentInterpreter(), []);
  const [instrument, setInstrument] = useState<AnyInstrument | null>(null);
  const [state, setState] = useState<InterpretedInstrumentState>({ status: 'LOADING' });
  const { i18n, t } = useTranslation();

  useEffect(() => {
    interpreter
      .interpret(bundle)
      .then(setInstrument)
      .catch((err) => {
        console.error(err);
        setState({ message: t('failedToLoadInstrument'), status: 'ERROR' });
      });
  }, [bundle]);

  useEffect(() => {
    if (instrument) {
      setState({ instrument: translateInstrument(instrument, i18n.resolvedLanguage!), status: 'DONE' });
    }
  }, [i18n.resolvedLanguage, instrument]);

  return state;
}
