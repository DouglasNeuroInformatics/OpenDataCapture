import { useMemo } from 'react';

import { useInstrumentInfoQuery } from '@/hooks/useInstrumentInfoQuery';

/**
 * Every accessible instrument's id mapped to its title.
 *
 * A record names only the instrument's id, which is all a per-instrument view needs — but a series
 * view shows records from several instruments at once and has to name each one.
 */
export function useInstrumentTitles(): { [id: string]: string } {
  const query = useInstrumentInfoQuery({ params: { allEditions: true } });
  return useMemo(
    () => Object.fromEntries((query.data ?? []).map((info) => [info.id, info.details.title])),
    [query.data]
  );
}
