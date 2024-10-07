import { $Group } from '@opendatacapture/schemas/group';
import { useSuspenseQuery } from '@tanstack/react-query';
import axios from 'axios';

export function useGroupsQuery() {
  return useSuspenseQuery({
    queryFn: async () => {
      const response = await axios.get('/v1/groups');
      return $Group.array().parse(response.data);
    },
    queryKey: ['groups']
  });
}
