import { $PermissionSetSummary } from '@opendatacapture/schemas/permission-set';
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import axios from 'axios';

export const PERMISSION_SETS_QUERY_KEY = 'permission-sets';

export const permissionSetsQueryOptions = () => {
  return queryOptions({
    queryFn: async () => {
      const response = await axios.get('/v1/permission-sets');
      return $PermissionSetSummary.array().parse(response.data);
    },
    queryKey: [PERMISSION_SETS_QUERY_KEY]
  });
};

export function usePermissionSetsQuery() {
  return useSuspenseQuery(permissionSetsQueryOptions());
}
