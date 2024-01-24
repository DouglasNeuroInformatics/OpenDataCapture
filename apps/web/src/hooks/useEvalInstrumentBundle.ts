import { useEffect, useState } from 'react';

import type { AnyInstrument, InstrumentKind } from '@open-data-capture/common/instrument';
import { type InstrumentInterpreterOptions } from '@open-data-capture/instrument-interpreter';

import { useInstrumentInterpreter } from './useInstrumentInterpreter';

export function useEvalInstrumentBundle<TKind extends InstrumentKind>(
  bundle: null | string | undefined,
  options?: Omit<InstrumentInterpreterOptions<TKind>, 'validate'>
) {
  const interpreter = useInstrumentInterpreter();
  const [instrument, setInstrument] = useState<Extract<AnyInstrument, { kind: TKind }> | null>(null);

  useEffect(() => {
    if (bundle) {
      interpreter
        .interpret(bundle, { ...options, validate: import.meta.env.DEV })
        .then(setInstrument)
        .catch((err) => {
          console.error(err);
          setInstrument(null);
        });
    } else {
      setInstrument(null);
    }
  }, [bundle]);

  return instrument;
}
