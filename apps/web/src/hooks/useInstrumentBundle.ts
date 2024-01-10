import { useEffect, useState } from 'react';

import {
  type EvaluateInstrumentOptions,
  type Instrument,
  type InstrumentKind,
  evaluateInstrument
} from '@open-data-capture/common/instrument';

export function useInstrumentBundle<TKind extends InstrumentKind>(
  bundle: null | string | undefined,
  options?: Omit<EvaluateInstrumentOptions<TKind>, 'validate'>
) {
  const [instrument, setInstrument] = useState<Extract<Instrument, { kind: TKind }> | null>(null);

  useEffect(() => {
    if (bundle) {
      evaluateInstrument(bundle, { ...options, validate: import.meta.env.DEV })
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
