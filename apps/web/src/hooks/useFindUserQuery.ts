import { $User } from '@opendatacapture/schemas/user';
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import axios from 'axios';

import { USERS_QUERY_KEY } from './useUsersQuery';

export const useFindUserQueryOptions = (id: string) => {
  return queryOptions({
    queryFn: async () => {
      const response = await axios.get(`/v1/users/${id}`);
      return $User.parse(response.data);
    },
    queryKey: [USERS_QUERY_KEY, id]
  });
};

export function useFindUserQuery(id: string) {
  return useSuspenseQuery(useFindUserQueryOptions(id));
}
