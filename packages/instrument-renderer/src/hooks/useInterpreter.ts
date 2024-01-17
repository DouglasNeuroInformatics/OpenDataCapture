import { useEffect, useMemo, useState } from 'react';

import type { Instrument } from '@open-data-capture/common/instrument';
import { InstrumentInterpreter } from '@open-data-capture/instrument-interpreter';

export function useInterpreter(bundle: string) {
  const interpreter = useMemo(() => new InstrumentInterpreter(), []);
  const [instrument, setInstrument] = useState<Instrument | null>(null);

  useEffect(() => {
    interpreter.interpret(bundle).then(setInstrument).catch(console.error);
  }, [bundle]);

  return instrument;
}
