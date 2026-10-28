import { $InstrumentRepoSyncLog } from '@opendatacapture/schemas/instrument-repo';
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import axios from 'axios';

export const INSTRUMENT_REPO_SYNC_LOGS_QUERY_KEY = 'instrument-repo-sync-logs';

export const instrumentRepoSyncLogsQueryOptions = () => {
  return queryOptions({
    queryFn: async () => {
      const response = await axios.get('/v1/instrument-repos/sync/logs');
      return $InstrumentRepoSyncLog.array().parse(response.data);
    },
    queryKey: [INSTRUMENT_REPO_SYNC_LOGS_QUERY_KEY]
  });
};

export function useInstrumentRepoSyncLogsQuery() {
  return useSuspenseQuery(instrumentRepoSyncLogsQueryOptions());
}
