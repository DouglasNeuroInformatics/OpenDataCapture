import { useNotificationsStore } from '@douglasneuroinformatics/libui/hooks';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

import { PERMISSION_SETS_QUERY_KEY } from './usePermissionSetsQuery';
import { USERS_QUERY_KEY } from './useUsersQuery';

export function useDeletePermissionSetMutation() {
  const queryClient = useQueryClient();
  const addNotification = useNotificationsStore((store) => store.addNotification);
  return useMutation({
    mutationFn: ({ id }: { id: string }) => axios.delete(`/v1/permission-sets/${id}`),
    onSuccess() {
      addNotification({ type: 'success' });
      void queryClient.invalidateQueries({ queryKey: [PERMISSION_SETS_QUERY_KEY] });
      // Deleting a set takes it from every holder, so any cached user still naming it is stale.
      void queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
    }
  });
}
