import { $User } from '@opendatacapture/schemas/user';
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import axios from 'axios';

export const USERS_QUERY_KEY = 'users';

export const usersQueryOptions = () => {
  return queryOptions({
    queryFn: async () => {
      const response = await axios.get('/v1/users');
      return $User.array().parse(response.data);
    },
    queryKey: [USERS_QUERY_KEY]
  });
};

export function useUsersQuery() {
  return useSuspenseQuery(usersQueryOptions());
}
