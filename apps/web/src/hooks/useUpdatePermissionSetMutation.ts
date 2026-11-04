import { useNotificationsStore } from '@douglasneuroinformatics/libui/hooks';
import type { $UpdatePermissionSetData } from '@opendatacapture/schemas/permission-set';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

import { PERMISSION_SETS_QUERY_KEY } from './usePermissionSetsQuery';

export function useUpdatePermissionSetMutation() {
  const queryClient = useQueryClient();
  const addNotification = useNotificationsStore((store) => store.addNotification);
  return useMutation({
    mutationFn: ({ data, id }: { data: $UpdatePermissionSetData; id: string }) => {
      return axios.patch(`/v1/permission-sets/${id}`, data, { meta: { disableDefaultErrorNotification: true } });
    },
    onSuccess() {
      addNotification({ type: 'success' });
      void queryClient.invalidateQueries({ queryKey: [PERMISSION_SETS_QUERY_KEY] });
    },
    // The edit page catches the rejection to report it on the form, which keeps the admin's edits.
    throwOnError: false
  });
}
