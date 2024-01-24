import { useMemo } from 'react';

import { InstrumentInterpreter } from '@open-data-capture/instrument-interpreter';

export const useInstrumentInterpreter = () => {
  return useMemo(() => new InstrumentInterpreter(), []);
};
