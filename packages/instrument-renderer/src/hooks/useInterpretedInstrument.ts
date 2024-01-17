import { useEffect, useMemo, useState } from 'react';

import type { AnyInstrument } from '@open-data-capture/common/instrument';
import { InstrumentInterpreter } from '@open-data-capture/instrument-interpreter';

/**
 * Interpret an instrument bundle directly in the browser
 *
 * @param bundle - the JavaScript code to be interpreted directly in the browser
 * @returns The instrument generated from the code
 */
export function useInterpretedInstrument(bundle: string) {
  const interpreter = useMemo(() => new InstrumentInterpreter(), []);
  const [instrument, setInstrument] = useState<AnyInstrument | null>(null);

  useEffect(() => {
    interpreter.interpret(bundle).then(setInstrument).catch(console.error);
  }, [bundle]);

  return instrument;
}
