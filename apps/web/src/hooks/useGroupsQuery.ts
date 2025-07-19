import { $Group } from '@opendatacapture/schemas/group';
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import axios from 'axios';

export const GROUPS_QUERY_KEY = 'groups';

export const groupsQueryOptions = () => {
  return queryOptions({
    queryFn: async () => {
      const response = await axios.get('/v1/groups');
      return $Group.array().parse(response.data);
    },
    queryKey: [GROUPS_QUERY_KEY]
  });
};

export function useGroupsQuery() {
  return useSuspenseQuery(groupsQueryOptions());
}
