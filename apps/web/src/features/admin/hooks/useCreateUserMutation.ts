import { useNotificationsStore } from '@douglasneuroinformatics/libui/hooks';
import type { CreateUserData } from '@opendatacapture/schemas/user';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

export function useCreateUserMutation() {
  const queryClient = useQueryClient();
  const addNotification = useNotificationsStore((store) => store.addNotification);
  return useMutation({
    mutationFn: ({ data }: { data: CreateUserData }) => axios.post('/v1/users', data),
    onSuccess() {
      addNotification({ type: 'success' });
      void queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });
}
