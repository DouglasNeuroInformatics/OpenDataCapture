import { $User } from '@opendatacapture/schemas/user';
import { useSuspenseQuery } from '@tanstack/react-query';
import axios from 'axios';

export function useUsersQuery() {
  return useSuspenseQuery({
    queryFn: async () => {
      const response = await axios.get('/v1/users');
      return $User.array().parse(response.data);
    },
    queryKey: ['users']
  });
}
