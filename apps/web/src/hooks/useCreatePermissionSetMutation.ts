import { useNotificationsStore } from '@douglasneuroinformatics/libui/hooks';
import type { $CreatePermissionSetData } from '@opendatacapture/schemas/permission-set';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

import { PERMISSION_SETS_QUERY_KEY } from './usePermissionSetsQuery';

export function useCreatePermissionSetMutation() {
  const queryClient = useQueryClient();
  const addNotification = useNotificationsStore((store) => store.addNotification);
  return useMutation({
    mutationFn: ({ data }: { data: $CreatePermissionSetData }) => {
      return axios.post('/v1/permission-sets', data, { meta: { disableDefaultErrorNotification: true } });
    },
    onSuccess() {
      addNotification({ type: 'success' });
      void queryClient.invalidateQueries({ queryKey: [PERMISSION_SETS_QUERY_KEY] });
    },
    // The create page catches the rejection to report it on the form, which keeps what the admin
    // entered -- a name already taken, most often -- so it must not also escape to the error boundary.
    throwOnError: false
  });
}
