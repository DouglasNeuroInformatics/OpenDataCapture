import { useNotificationsStore } from '@douglasneuroinformatics/libui/hooks';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

export function useDeleteGroupMutation() {
  const queryClient = useQueryClient();
  const addNotification = useNotificationsStore((store) => store.addNotification);
  return useMutation({
    mutationFn: ({ id }: { id: string }) => axios.delete(`/v1/groups/${id}`),
    onSuccess() {
      addNotification({ type: 'success' });
      void queryClient.invalidateQueries({ queryKey: ['groups'] });
    }
  });
}
