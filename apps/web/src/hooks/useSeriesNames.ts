import { useMemo } from 'react';

import { useInstrumentInfoQuery } from '@/hooks/useInstrumentInfoQuery';

/**
 * Maps every accessible series instrument's id to its title.
 *
 * A record names the series that collected it by id alone, and a series instrument carries no
 * `internal.name` to fall back on, so the title has to be looked up separately from the scalar
 * instrument the record was collected with.
 */
export function useSeriesNames(): { [id: string]: string } {
  const query = useInstrumentInfoQuery({ params: { kind: 'SERIES' } });
  return useMemo(
    () => Object.fromEntries((query.data ?? []).map((info) => [info.id, info.details.title])),
    [query.data]
  );
}
