import { useEffect, useState } from 'react';

import type { InstrumentKind, SomeUnilingualInstrument } from '@open-data-capture/common/instrument';
import { translateInstrument } from '@open-data-capture/instrument-utils';
import { useTranslation } from 'react-i18next';

import { useInstrumentBundle } from './useInstrumentBundle';
import { useInstrumentInterpreter } from './useInstrumentInterpreter';

export function useInstrument<TKind extends InstrumentKind>(id: string, options?: { kind?: TKind }) {
  const instrumentBundleQuery = useInstrumentBundle(id);
  const interpreter = useInstrumentInterpreter();
  const [instrument, setInstrument] = useState<SomeUnilingualInstrument<TKind> | null>(null);
  const { i18n } = useTranslation();

  useEffect(() => {
    if (instrumentBundleQuery.data) {
      const { bundle, id } = instrumentBundleQuery.data;
      interpreter
        .interpret(bundle, { id, validate: import.meta.env.DEV, ...options })
        .then((instrument) => setInstrument(translateInstrument(instrument, i18n.resolvedLanguage!)))
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
