import { $Group } from '@opendatacapture/schemas/group';
import { queryOptions, useQuery } from '@tanstack/react-query';
import axios from 'axios';

export const GROUP_QUERY_KEY = 'group';

export const groupQueryOptions = (groupId: null | string | undefined) =>
  queryOptions({
    enabled: Boolean(groupId),
    queryFn: async () => {
      const response = await axios.get(`/v1/groups/${groupId}`);
      return $Group.parseAsync(response.data);
    },
    queryKey: [GROUP_QUERY_KEY, groupId]
  });

export function useGroupQuery(groupId: null | string | undefined) {
  return useQuery(groupQueryOptions(groupId));
}
