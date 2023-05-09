import { useMemo } from 'react';

import { SubjectFormRecords } from '@douglasneuroinformatics/common';

/** Returns an object with instrument identifiers mapped to titles */
export function useInstrumentOptions(data: SubjectFormRecords[]) {
  return useMemo(
    () =>
      Object.fromEntries(
        data
          .filter(({ instrument }) => instrument.measures)
          .map(({ instrument }) => [instrument.identifier, instrument.details.title])
      ),
    [data]
  );
}
