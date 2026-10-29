import { $InstrumentRepoSyncLog } from '@opendatacapture/schemas/instrument-repo';
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import axios from 'axios';

import { INSTRUMENT_REPO_SYNC_LOGS_QUERY_KEY } from './useInstrumentRepoSyncLogsQuery';

/**
 * The newest activity log entry per repository, for the repositories table's failed count. It keys
 * under the history's own key so that invalidating the history refreshes this too.
 */
export const latestInstrumentRepoSyncLogsQueryOptions = () => {
  return queryOptions({
    queryFn: async () => {
      const response = await axios.get('/v1/instrument-repos/sync/logs/latest');
      return $InstrumentRepoSyncLog.array().parse(response.data);
    },
    queryKey: [INSTRUMENT_REPO_SYNC_LOGS_QUERY_KEY, 'latest']
  });
};

export function useLatestInstrumentRepoSyncLogsQuery() {
  return useSuspenseQuery(latestInstrumentRepoSyncLogsQueryOptions());
}
