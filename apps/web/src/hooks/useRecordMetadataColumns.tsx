import { useMemo } from 'react';

import { TanstackTable } from '@douglasneuroinformatics/libui/components';
import type { SessionType } from '@opendatacapture/schemas/session';

import { TruncatedCell } from '@/components/TruncatedCell';
import { useCollectionMethodLabels } from '@/hooks/useCollectionMethodLabels';
import { NO_SERIES } from '@/hooks/useInstrumentHubFacets';
import type { InstrumentVisualizationRecord } from '@/hooks/useInstrumentVisualization';

/** Shown where a record carries no series, or a session whose type could not be resolved */
const EMPTY_CELL = '—';

/**
 * The provenance columns every record table shows: how the record was collected, and the series it
 * was collected under, if any. A series cell holding a name is itself the answer to whether the
 * record was collected individually, which is why there is no separate column for that.
 */
export function useRecordMetadataColumns({
  omitSeries = false
}: {
  /** Set on a series' own page, where every row names that same series and the column says nothing */
  omitSeries?: boolean;
} = {}): TanstackTable.ColumnDef<InstrumentVisualizationRecord>[] {
  const collectionMethodLabels = useCollectionMethodLabels();
  return useMemo(() => {
    const columns: TanstackTable.ColumnDef<InstrumentVisualizationRecord>[] = [
      {
        accessorKey: '__method__',
        cell: (ctx) => {
          const value = ctx.getValue() as null | SessionType;
          const label = value ? collectionMethodLabels[value] : EMPTY_CELL;
          return <TruncatedCell data-testid="record-cell-collection-method" title={label} value={label} />;
        },
        filterFn: (row, id, filter: SessionType[]) => filter.includes(row.getValue(id)),
        header: 'COLLECTION_METHOD',
        id: '__method__'
      }
    ];
    if (omitSeries) {
      return columns;
    }
    columns.push({
      accessorKey: '__seriesName__',
      cell: (ctx) => {
        // A series title is the longest thing in the row and the first to wrap, which is what
        // drove this column to one clipped line.
        const label = (ctx.getValue() as null | string) ?? EMPTY_CELL;
        return <TruncatedCell data-testid="record-cell-series" title={label} value={label} />;
      },
      // Filtered on the id rather than the displayed name, since a name is not a stable identity.
      // The empty string stands for a record collected outside any series.
      filterFn: (row, _id, filter: string[]) => filter.includes(row.original.__seriesId__ ?? NO_SERIES),
      header: 'SERIES',
      id: '__seriesName__'
    });
    return columns;
  }, [collectionMethodLabels, omitSeries]);
}
