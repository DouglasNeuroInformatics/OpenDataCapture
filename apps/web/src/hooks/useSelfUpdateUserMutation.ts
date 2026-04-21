import { useNotificationsStore } from '@douglasneuroinformatics/libui/hooks';
import { $SelfUpdateUserData } from '@opendatacapture/schemas/user';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

import { USERS_QUERY_KEY } from './useUsersQuery';

export function useSelfUpdateUserMutation() {
  const queryClient = useQueryClient();
  const addNotification = useNotificationsStore((store) => store.addNotification);
  return useMutation({
    mutationFn: async ({ data, id }: { data: $SelfUpdateUserData; id: string }) => {
      await axios.patch(`/v1/users/self-update/${id}`, data);
    },
    onSuccess() {
      addNotification({ type: 'success' });
      void queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
    }
  });
}
