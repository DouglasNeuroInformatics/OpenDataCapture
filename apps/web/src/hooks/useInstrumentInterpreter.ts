import { useMemo } from 'react';

import { InstrumentInterpreter } from '@opendatacapture/instrument-interpreter';

export const useInstrumentInterpreter = () => {
  return useMemo(() => new InstrumentInterpreter(), []);
};
