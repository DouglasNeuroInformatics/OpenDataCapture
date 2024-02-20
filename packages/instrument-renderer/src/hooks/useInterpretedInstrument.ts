import { useEffect, useMemo, useState } from 'react';

import type { AnyInstrument, AnyUnilingualInstrument, InstrumentKind } from '@open-data-capture/common/instrument';
import { InstrumentInterpreter, type InterpretOptions } from '@open-data-capture/instrument-interpreter';
import { translateInstrument } from '@open-data-capture/instrument-utils';
import { useTranslation } from 'react-i18next';

export type InterpretedInstrumentState =
  | { instrument: AnyUnilingualInstrument; status: 'DONE' }
  | { status: 'ERROR' }
  | { status: 'LOADING' };

/**
 * Interpret an instrument bundle directly in the browser
 *
 * @param bundle - the JavaScript code to be interpreted directly in the browser
 * @returns The instrument generated from the code, translated into the current locale, if possible, otherwise the default
 */
export function useInterpretedInstrument<TKind extends InstrumentKind>(
  bundle: string,
  options?: InterpretOptions<TKind>
) {
  const interpreter = useMemo(() => new InstrumentInterpreter(), []);
  const [instrument, setInstrument] = useState<AnyInstrument | null>(null);
  const [state, setState] = useState<InterpretedInstrumentState>({ status: 'LOADING' });
  const { i18n } = useTranslation();

  useEffect(() => {
    interpreter
      .interpret(bundle, options)
      .then(setInstrument)
      .catch((err) => {
        console.error(err);
        setState({ status: 'ERROR' });
      });
  }, [bundle]);

  useEffect(() => {
    if (instrument) {
      setState({ instrument: translateInstrument(instrument, i18n.resolvedLanguage!), status: 'DONE' });
    }
  }, [i18n.resolvedLanguage, instrument]);

  return state;
}
