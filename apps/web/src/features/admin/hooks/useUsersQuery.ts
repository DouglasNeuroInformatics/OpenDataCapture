import { $User } from '@opendatacapture/schemas/user';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export function useUsersQuery() {
  return useQuery({
    queryFn: async () => {
      const response = await axios.get('/v1/users');
      return $User.array().parse(response.data);
    },
    queryKey: ['users']
  });
}
