import { useNotificationsStore } from '@douglasneuroinformatics/libui/hooks';
import type { Permissions } from '@opendatacapture/schemas/core';
import type { $UpdateUserData, $UpdateUserPermissionsData } from '@opendatacapture/schemas/user';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

import { USERS_QUERY_KEY } from './useUsersQuery';

export function useUpdateUserMutation() {
  const queryClient = useQueryClient();
  const addNotification = useNotificationsStore((store) => store.addNotification);
  return useMutation({
    mutationFn: async ({ data, id, permissions }: { data: $UpdateUserData; id: string; permissions?: Permissions }) => {
      await axios.patch(`/v1/users/${id}`, data, { meta: { disableDefaultErrorNotification: true } });
      if (permissions !== undefined) {
        const permissionsData: $UpdateUserPermissionsData = { permissions };
        await axios.put(`/v1/users/${id}/permissions`, permissionsData, {
          meta: { disableDefaultErrorNotification: true }
        });
      }
    },
    onSuccess() {
      addNotification({ type: 'success' });
      void queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
    },
    // The caller catches the rejection and shows its own inline message; the app default would replace
    // the page with the route error boundary.
    throwOnError: false
  });
}
