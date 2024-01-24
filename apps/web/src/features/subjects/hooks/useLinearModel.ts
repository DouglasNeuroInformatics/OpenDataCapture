import { $LinearRegressionResults } from '@open-data-capture/common/instrument-records';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

type UseLinearModelOptions = {
  enabled?: boolean;
  params: {
    groupId?: string;
    instrumentId?: string;
  };
};

export const useLinearModel = (
  { enabled, params }: UseLinearModelOptions = {
    enabled: true,
    params: {}
  }
) => {
  return useQuery({
    enabled,
    queryFn: async () => {
      const response = await axios.get('/v1/instrument-records/linear-model', {
        params
      });
      return $LinearRegressionResults.parseAsync(response.data);
    },
    queryKey: ['linear-model', ...Object.values(params)]
  });
};
