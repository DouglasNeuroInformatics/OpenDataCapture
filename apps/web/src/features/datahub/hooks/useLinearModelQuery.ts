import { $LinearRegressionResults } from '@opendatacapture/schemas/instrument-records';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

type UseLinearModelOptions = {
  enabled?: boolean;
  params: {
    groupId?: string;
    instrumentId?: string;
  };
};

export function useLinearModelQuery({ enabled, params }: UseLinearModelOptions) {
  return useQuery({
    enabled,
    queryFn: async () => {
      const response = await axios.get('/v1/instrument-records/linear-model', {
        params
      });
      return $LinearRegressionResults.parseAsync(response.data);
    },
    queryKey: ['linear-model', params.groupId, params.instrumentId]
  });
}
