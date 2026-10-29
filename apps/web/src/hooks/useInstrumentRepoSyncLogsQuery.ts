import {
  $InstrumentRepoSyncLogsPage,
  INSTRUMENT_REPO_SYNC_LOGS_PAGE_SIZE
} from '@opendatacapture/schemas/instrument-repo';
import { keepPreviousData, queryOptions, useQuery } from '@tanstack/react-query';
import axios from 'axios';

type InstrumentRepoSyncLogsQueryParams = {
  page?: number;
  repoId?: string;
  sortOrder?: 'asc' | 'desc';
};

export const INSTRUMENT_REPO_SYNC_LOGS_QUERY_KEY = 'instrument-repo-sync-logs';

export const instrumentRepoSyncLogsQueryOptions = ({
  params = {}
}: { params?: InstrumentRepoSyncLogsQueryParams } = {}) => {
  return queryOptions({
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const response = await axios.get('/v1/instrument-repos/sync/logs', {
        params: { limit: INSTRUMENT_REPO_SYNC_LOGS_PAGE_SIZE, ...params }
      });
      return $InstrumentRepoSyncLogsPage.parse(response.data);
    },
    queryKey: [INSTRUMENT_REPO_SYNC_LOGS_QUERY_KEY, params],
    // The route loader prefetches the first page right before the table mounts, and `useQuery` would
    // otherwise refetch it at once as stale. One second is the floor `useSuspenseQuery` applies.
    staleTime: 1000
  });
};

export function useInstrumentRepoSyncLogsQuery({ params = {} }: { params?: InstrumentRepoSyncLogsQueryParams } = {}) {
  return useQuery(instrumentRepoSyncLogsQueryOptions({ params }));
}
