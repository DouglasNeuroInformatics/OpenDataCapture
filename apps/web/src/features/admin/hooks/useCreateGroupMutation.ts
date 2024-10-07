import { useNotificationsStore } from '@douglasneuroinformatics/libui/hooks';
import type { CreateGroupData } from '@opendatacapture/schemas/group';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

export function useCreateGroupMutation() {
  const queryClient = useQueryClient();
  const addNotification = useNotificationsStore((store) => store.addNotification);
  return useMutation({
    mutationFn: ({ data }: { data: CreateGroupData }) => axios.post('/v1/groups', data),
    onSuccess() {
      addNotification({ type: 'success' });
      void queryClient.invalidateQueries({ queryKey: ['groups'] });
    }
  });
}
