import { $Group } from '@opendatacapture/schemas/group';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export function useGroupsQuery() {
  return useQuery({
    queryFn: async () => {
      const response = await axios.get('/v1/groups');
      return $Group.array().parse(response.data);
    },
    queryKey: ['groups']
  });
}
