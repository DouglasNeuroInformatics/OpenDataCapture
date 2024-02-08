import { $LinearRegressionResults, type LinearRegressionResults } from '@open-data-capture/common/instrument-records';
import { useSuspenseQuery } from '@tanstack/react-query';
import axios from 'axios';

type UseLinearModelOptions = {
  enabled?: boolean;
  params: {
    groupId?: string;
    instrumentId?: string;
  };
};

export function useLinearModelQuery({ params }: UseLinearModelOptions) {
  return useSuspenseQuery({
    queryFn: async () => {
      if (!params.instrumentId) {
        return {} satisfies LinearRegressionResults;
      }
      const response = await axios.get('/v1/instrument-records/linear-model', {
        params
      });
      console.log(response.data);
      return $LinearRegressionResults.parseAsync(response.data);
    },
    queryKey: ['linear-model', params.groupId, params.instrumentId]
  });
}
