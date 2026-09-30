import { $SeriesInstrumentOverview } from '@opendatacapture/schemas/instrument';
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import axios from 'axios';

export const SERIES_INSTRUMENTS_OVERVIEW_QUERY_KEY = 'series-instruments-overview';

export const seriesInstrumentsOverviewQueryOptions = () => {
  return queryOptions({
    queryFn: async () => {
      const response = await axios.get('/v1/instruments/series');
      return $SeriesInstrumentOverview.array().parse(response.data);
    },
    queryKey: [SERIES_INSTRUMENTS_OVERVIEW_QUERY_KEY]
  });
};

export function useSeriesInstrumentsOverviewQuery() {
  return useSuspenseQuery(seriesInstrumentsOverviewQueryOptions());
}
