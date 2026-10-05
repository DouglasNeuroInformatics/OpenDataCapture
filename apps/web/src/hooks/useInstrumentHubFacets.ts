import { useMemo } from 'react';

import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { useParams } from '@tanstack/react-router';

import { useInstrumentInfoQuery } from '@/hooks/useInstrumentInfoQuery';
import { useInstrumentRecords } from '@/hooks/useInstrumentRecords';
import { useSeriesNames } from '@/hooks/useSeriesNames';
import { useAppStore } from '@/store';
import { getEditionOptions } from '@/utils/instrument-editions';

/** Stands for "collected outside any series" wherever a series id is expected */
const NO_SERIES = '';

const INSTRUMENT_HUB_ROUTE = '/_app/datahub/instruments/$instrumentId';

/**
 * What the instrument hub's header and filter controls need: the instrument's title, its sibling
 * editions, and the series its records were collected under.
 *
 * Deliberately built from the instrument catalog and the record list rather than from
 * `useInstrumentVisualization`, because that hook interprets the instrument's bundle — which runs
 * the bundle as a module, and validates it in development. Calling it here as well as in the active
 * tab would do that twice per page for a title and two dropdowns that need none of it.
 */
export function useInstrumentHubFacets() {
  const { instrumentId } = useParams({ from: INSTRUMENT_HUB_ROUTE });
  const currentGroup = useAppStore((store) => store.currentGroup);
  const { t } = useTranslation();

  const infoQuery = useInstrumentInfoQuery({ params: { allEditions: true } });
  const recordsQuery = useInstrumentRecords({ params: { groupId: currentGroup?.id, instrumentId } });

  const seriesNames = useSeriesNames();

  const editionLabel = t({ en: 'Edition', es: 'Edición', fr: 'Édition' });
  const editionOptions = useMemo(
    () => getEditionOptions(infoQuery.data ?? [], instrumentId, editionLabel),
    [infoQuery.data, instrumentId, editionLabel]
  );

  const info = useMemo(
    () => infoQuery.data?.find((entry) => entry.id === instrumentId) ?? null,
    [infoQuery.data, instrumentId]
  );
  const title = info?.details.title ?? null;
  // A series orchestrates records across the instruments it composes, so its page is a different
  // shape: no shared measures, and therefore no measure columns and no chart.
  const isSeries = info?.kind === 'SERIES';

  /** The series actually present for this instrument, which is what the filter can offer */
  const seriesOptions = useMemo(() => {
    const options = new Map<string, null | string>();
    for (const record of recordsQuery.data ?? []) {
      const seriesId = record.seriesInstrumentId ?? null;
      options.set(seriesId ?? NO_SERIES, seriesId ? (seriesNames[seriesId] ?? null) : null);
    }
    return options;
  }, [recordsQuery.data, seriesNames]);

  return { editionOptions, isSeries, seriesOptions, title };
}

export { NO_SERIES };
