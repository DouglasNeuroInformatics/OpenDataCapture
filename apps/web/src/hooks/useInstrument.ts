import { useEffect, useState } from 'react';

import type { InstrumentKind, SomeInstrument } from '@open-data-capture/common/instrument';

import { useInstrumentBundle } from './useInstrumentBundle';
import { useInstrumentInterpreter } from './useInstrumentInterpreter';

export function useInstrument<TKind extends InstrumentKind>(id: string, options?: { kind?: TKind }) {
  const instrumentBundleQuery = useInstrumentBundle(id);
  const interpreter = useInstrumentInterpreter();
  const [instrument, setInstrument] = useState<SomeInstrument<TKind> | null>(null);

  useEffect(() => {
    if (instrumentBundleQuery.data) {
      const { bundle, id } = instrumentBundleQuery.data;
      interpreter
        .interpret(bundle, { id, validate: import.meta.env.DEV, ...options })
        .then(setInstrument)
        .catch((err) => {
          console.error(err);
          setInstrument(null);
        });
    } else {
      setInstrument(null);
    }
  }, [instrumentBundleQuery.data]);

  return instrument;
}
