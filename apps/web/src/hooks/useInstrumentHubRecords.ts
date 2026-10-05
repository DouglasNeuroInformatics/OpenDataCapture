import { useCallback } from 'react';

import { useParams, useSearch } from '@tanstack/react-router';

import { NO_SERIES, useInstrumentHubFacets } from '@/hooks/useInstrumentHubFacets';
import { useInstrumentVisualization } from '@/hooks/useInstrumentVisualization';
import type { InstrumentVisualizationRecord } from '@/hooks/useInstrumentVisualization';

const INSTRUMENT_HUB_ROUTE = '/_app/datahub/instruments/$instrumentId';

/**
 * Every record collected with the instrument named by the route, narrowed by the search params the
 * parent route owns.
 *
 * Both tabs read through this, and the filter is handed to the visualization hook rather than
 * applied afterwards, so the table, the chart and the download always describe the same set.
 */
export function useInstrumentHubRecords() {
  const { instrumentId } = useParams({ from: INSTRUMENT_HUB_ROUTE });
  const { methods, minDate, series } = useSearch({ from: INSTRUMENT_HUB_ROUTE });

  const filterRecord = useCallback(
    (record: InstrumentVisualizationRecord) => {
      // An absent `methods` filter means every method, which an empty array deliberately does not.
      // A record whose session was deleted carries no method, so it matches no explicit selection —
      // it survives the unfiltered view and is excluded as soon as the filter narrows.
      if (methods && (!record.__method__ || !methods.includes(record.__method__))) {
        return false;
      }
      // An absent `series` filter means every series, which is not an empty selection.
      if (series && !series.includes(record.__seriesId__ ?? NO_SERIES)) {
        return false;
      }
      return true;
    },
    [methods, series]
  );

  const { isSeries } = useInstrumentHubFacets();

  // A series is named through `seriesInstrumentId`; records never carry it as their `instrumentId`,
  // so asking for it that way would always come back empty.
  return useInstrumentVisualization({
    params: {
      filterRecord,
      instrumentId: isSeries ? undefined : instrumentId,
      minDate,
      seriesInstrumentId: isSeries ? instrumentId : undefined
    }
  });
}
