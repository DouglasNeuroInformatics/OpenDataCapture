import { $User } from '@opendatacapture/schemas/user';
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import axios from 'axios';

type UsersQueryParams = {
  groupId?: string;
};

export const USERS_QUERY_KEY = 'users';

export const usersQueryOptions = ({ params }: { params?: UsersQueryParams } = {}) => {
  return queryOptions({
    queryFn: async () => {
      const response = await axios.get('/v1/users', { params });
      return $User.array().parse(response.data);
    },
    queryKey: [USERS_QUERY_KEY]
  });
};

export function useUsersQuery({ params }: { params?: UsersQueryParams } = {}) {
  return useSuspenseQuery(usersQueryOptions({ params }));
}
