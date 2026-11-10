import { $Summary } from '@opendatacapture/schemas/summary';
import type { SummaryTrendWindow } from '@opendatacapture/schemas/summary';
import { keepPreviousData, queryOptions, useQuery } from '@tanstack/react-query';
import axios from 'axios';

type SummaryQueryParams = {
  groupId?: string;
  recordTrendWindow?: SummaryTrendWindow;
  subjectTrendWindow?: SummaryTrendWindow;
};

export const summaryQueryOptions = ({ params }: { params?: SummaryQueryParams } = {}) => {
  return queryOptions({
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const response = await axios.get('/v1/summary', {
        params
      });
      return $Summary.parse(response.data);
    },
    // An omitted window is the default one, so the loader's prefetch and the page share a cache entry.
    queryKey: [
      'summary',
      params?.groupId,
      params?.recordTrendWindow ?? 'default',
      params?.subjectTrendWindow ?? 'default'
    ]
  });
};

export const useSummaryQuery = ({ params }: { params?: SummaryQueryParams } = {}) => {
  return useQuery(summaryQueryOptions({ params }));
};
