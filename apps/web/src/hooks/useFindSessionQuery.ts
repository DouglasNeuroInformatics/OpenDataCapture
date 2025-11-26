import { $SessionWithUser } from '@opendatacapture/schemas/session';
import type { SessionWithUserQueryParams } from '@opendatacapture/schemas/session';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

//Change this query to into a hook method and name it useFindSessionQuery

//Change the api call to have an include tag which includes the username from users

//Change the return type to

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
      const parsedData = $SessionWithUser.array().safeParseAsync(response.data);
      if ((await parsedData).error) {
        const message = (await parsedData).error?.message;
        throw new Error(message);
      }
      return (await parsedData).data;
    },
    queryKey: ['sessions', ...Object.values(params)]
  });
};
