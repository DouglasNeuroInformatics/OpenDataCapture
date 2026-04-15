import { useNotificationsStore } from '@douglasneuroinformatics/libui/hooks';
import type { SelfUpdateUserData } from '@opendatacapture/schemas/user';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

import { USERS_QUERY_KEY } from './useUsersQuery';

export function useSelfUpdateUserMutation() {
  const queryClient = useQueryClient();
  const addNotification = useNotificationsStore((store) => store.addNotification);
  return useMutation({
    mutationFn: async ({ data, id }: { data: SelfUpdateUserData; id: string }) => {
      const submitData = { ...data };
      if (submitData.email === '') delete submitData.email;
      if (submitData.phoneNumber === '') delete submitData.phoneNumber;
      if (submitData.password === '') {
        delete submitData.password;
      }
      await axios.patch(`/v1/users/self-update/${id}`, submitData);
    },
    onSuccess() {
      addNotification({ type: 'success' });
      void queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
    }
  });
}
