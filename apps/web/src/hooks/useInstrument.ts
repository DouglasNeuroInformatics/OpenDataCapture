import { useEffect, useState } from 'react';

import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { translateInstrument } from '@opendatacapture/instrument-utils';
import type { AnyUnilingualInstrument } from '@opendatacapture/runtime-core';

import { useInstrumentBundle } from './useInstrumentBundle';
import { useInstrumentInterpreter } from './useInstrumentInterpreter';

export function useInstrument(id: null | string) {
  const instrumentBundleQuery = useInstrumentBundle(id);
  const interpreter = useInstrumentInterpreter();
  const [instrument, setInstrument] = useState<AnyUnilingualInstrument | null>(null);
  const { resolvedLanguage } = useTranslation();

  useEffect(() => {
    if (instrumentBundleQuery.data) {
      const { bundle, id } = instrumentBundleQuery.data;
      interpreter
        .interpret(bundle, { id, validate: import.meta.env.DEV })
        .then((instrument) => setInstrument(translateInstrument(instrument, resolvedLanguage)))
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
