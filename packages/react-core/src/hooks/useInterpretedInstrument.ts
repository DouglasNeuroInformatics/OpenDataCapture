import { useEffect, useMemo, useState } from 'react';

import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { InstrumentInterpreter } from '@opendatacapture/instrument-interpreter';
import type { InterpretOptions } from '@opendatacapture/instrument-interpreter';
import { translateInstrument } from '@opendatacapture/instrument-utils';
import type { AnyInstrument, AnyUnilingualInstrument, Language } from '@opendatacapture/runtime-core';

/** The outcome of interpreting one bundle, kept alongside the bundle that produced it. */
type Interpretation =
  | { bundle: string; error: Error; status: 'ERROR' }
  | { bundle: string; instrument: AnyInstrument; status: 'DONE' };

export type InterpretedInstrumentState<TInstrument extends AnyUnilingualInstrument = AnyUnilingualInstrument> =
  | { error: Error; status: 'ERROR' }
  | { instrument: TInstrument; status: 'DONE' }
  | { status: 'LOADING' };

/**
 * Interpret an instrument bundle directly in the browser
 *
 * @param bundle - the JavaScript code to be interpreted directly in the browser
 * @returns The instrument generated from the code, translated into the current locale, if possible, otherwise the default
 */
export function useInterpretedInstrument<TInstrument extends AnyUnilingualInstrument = AnyUnilingualInstrument>(
  bundle: string,
  options?: InterpretOptions
): InterpretedInstrumentState<TInstrument & { supportedLanguages: Language[] }> {
  const interpreter = useMemo(() => new InstrumentInterpreter(), []);
  const [interpretation, setInterpretation] = useState<Interpretation | null>(null);
  const { resolvedLanguage } = useTranslation();

  useEffect(() => {
    // A bundle that resolves after the hook has moved on to another one would otherwise be reported
    // as the outcome of that other bundle, or leave this stuck reporting LOADING for it forever.
    let isCurrent = true;
    interpreter
      .interpret(bundle, options)
      .then((instrument) => {
        if (isCurrent) {
          setInterpretation({ bundle, instrument, status: 'DONE' });
        }
      })
      .catch((error: unknown) => {
        console.error(error);
        if (isCurrent) {
          setInterpretation({
            bundle,
            error: error instanceof Error ? error : new Error('Unexpected Non-Error Thrown', { cause: error }),
            status: 'ERROR'
          });
        }
      });
    return () => {
      isCurrent = false;
    };
  }, [bundle]);

  return useMemo(() => {
    // Reporting DONE with the instrument of a previous bundle would let a caller keep the old one
    // mounted: a series with `skipProgress` would carry one item's answers into the next.
    if (interpretation?.bundle !== bundle) {
      return { status: 'LOADING' };
    } else if (interpretation.status === 'ERROR') {
      return { error: interpretation.error, status: 'ERROR' };
    }
    return {
      instrument: {
        ...(translateInstrument(interpretation.instrument, resolvedLanguage) as TInstrument),
        supportedLanguages: Array.isArray(interpretation.instrument.language)
          ? interpretation.instrument.language
          : [interpretation.instrument.language]
      },
      status: 'DONE'
    };
  }, [bundle, interpretation, resolvedLanguage]);
}
