import { $SetupState } from '@opendatacapture/schemas/setup';
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import axios from 'axios';

export const SETUP_STATE_QUERY_KEY = 'setup-state';

export const setupStateQueryOptions = () => {
  return queryOptions({
    queryFn: async () => {
      const response = await axios.get('/v1/setup');
      return $SetupState.parseAsync(response.data);
    },
    queryKey: [SETUP_STATE_QUERY_KEY],
    staleTime: Infinity
  });
};

export function useSetupStateQuery() {
  return useSuspenseQuery(setupStateQueryOptions());
}
