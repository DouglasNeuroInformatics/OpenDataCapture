import { $SessionWithUser } from '@opendatacapture/schemas/session';
import type { SessionWithUserQueryParams } from '@opendatacapture/schemas/session';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

type UseSessionOptions = {

type UseSessionOptions = {
  enabled?: boolean;
  params: SessionWithUserQueryParams;
};

export const useFindSessionQuery = (
  { enabled, params }: UseSessionOptions = {
    enabled: true,
    params: {}
  }
) => {
  return useQuery({
    enabled,
    queryFn: async () => {
      const response = await axios.get('/v1/sessions', {
        params
      });
      return $SessionWithUser.array().parseAsync(response.data);
    },
    queryKey: ['sessions', ...Object.values(params)]
  });
};
