import { reviver } from '@douglasneuroinformatics/libjs';
import { $Session } from '@opendatacapture/schemas/session';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

type UseSessionOptions = {
  enabled?: boolean;
  params: {
    id?: string;
  };
};

export const useFindSession = (
  { enabled, params }: UseSessionOptions = {
    enabled: true,
    params: {}
  }
) => {
  return useQuery({
    enabled,
    queryFn: async () => {
      const response = await axios.get('/v1/Sessions', {
        params,
        transformResponse: [(data: string) => JSON.parse(data, reviver) as unknown]
      });
      return $Session.array().parseAsync(response.data);
    },
    queryKey: ['sessions', ...Object.values(params)]
  });
};
