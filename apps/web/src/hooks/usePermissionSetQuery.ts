import { $PermissionSetSummary } from '@opendatacapture/schemas/permission-set';
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import axios from 'axios';

import { PERMISSION_SETS_QUERY_KEY } from './usePermissionSetsQuery';

/** Keyed under the list's key, so whatever invalidates the list refreshes the set as well. */
export const permissionSetQueryOptions = (id: string) => {
  return queryOptions({
    queryFn: async () => {
      const response = await axios.get(`/v1/permission-sets/${id}`);
      return $PermissionSetSummary.parse(response.data);
    },
    queryKey: [PERMISSION_SETS_QUERY_KEY, id]
  });
};

export function usePermissionSetQuery(id: string) {
  return useSuspenseQuery(permissionSetQueryOptions(id));
}
