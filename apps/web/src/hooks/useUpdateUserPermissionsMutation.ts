import { useNotificationsStore } from '@douglasneuroinformatics/libui/hooks';
import type { Permissions } from '@opendatacapture/schemas/core';
import { $User } from '@opendatacapture/schemas/user';
import type { UpdateUserPermissionsData } from '@opendatacapture/schemas/user';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

import { USERS_QUERY_KEY } from './useUsersQuery';

export function useUpdateUserPermissionsMutation() {
  const queryClient = useQueryClient();
  const addNotification = useNotificationsStore((store) => store.addNotification);
  return useMutation({
    mutationFn: async ({ id, permissions }: { id: string; permissions: Permissions }) => {
      const data: UpdateUserPermissionsData = { permissions };
      const response = await axios.put(`/v1/users/${id}/permissions`, data);
      return $User.parse(response.data);
    },
    onSuccess() {
      addNotification({ type: 'success' });
      void queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
    }
  });
}
