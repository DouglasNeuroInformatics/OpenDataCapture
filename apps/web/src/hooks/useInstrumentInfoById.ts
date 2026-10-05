import { useMemo } from 'react';

import type { InstrumentKind } from '@opendatacapture/runtime-core';

import { useInstrumentInfoQuery } from '@/hooks/useInstrumentInfoQuery';

type InstrumentInfoById = { [id: string]: { kind: InstrumentKind; title: string } };

/**
 * The accessible instrument catalog keyed by id, narrowed by the same params the info query takes.
 *
 * A record names the instrument that collected it by id alone, so every view that shows records
 * from more than one instrument — a series' member list, a series column, the collection-method
 * facets — has to resolve those ids against the catalog. They differ only in which slice of it they
 * ask for, which is why that is the parameter rather than three near-identical hooks.
 */
export function useInstrumentInfoById<TKind extends InstrumentKind>(params?: {
  allEditions?: boolean;
  kind?: TKind;
  subjectId?: string;
}): InstrumentInfoById {
  const query = useInstrumentInfoQuery({ params });
  return useMemo(
    () =>
      Object.fromEntries((query.data ?? []).map((info) => [info.id, { kind: info.kind, title: info.details.title }])),
    [query.data]
  );
}
