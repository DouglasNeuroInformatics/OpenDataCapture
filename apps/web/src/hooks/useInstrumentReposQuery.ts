import { $InstrumentRepo } from '@opendatacapture/schemas/instrument-repo';
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import axios from 'axios';

export const INSTRUMENT_REPOS_QUERY_KEY = 'instrument-repos';

export const instrumentReposQueryOptions = () => {
  return queryOptions({
    queryFn: async () => {
      const response = await axios.get('/v1/instrument-repos');
      return $InstrumentRepo.array().parse(response.data);
    },
    queryKey: [INSTRUMENT_REPOS_QUERY_KEY]
  });
};

export function useInstrumentReposQuery() {
  return useSuspenseQuery(instrumentReposQueryOptions());
}
