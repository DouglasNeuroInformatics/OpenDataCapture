import { useNotificationsStore } from '@douglasneuroinformatics/libui/hooks';
import type { UpdateSetupStateData } from '@opendatacapture/schemas/setup';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

export function useUpdateSetupStateMutation() {
  const addNotification = useNotificationsStore((store) => store.addNotification);
  return useMutation({
    mutationFn: async (data: UpdateSetupStateData) => {
      await axios.patch('/v1/setup', data);
    },
    onSuccess() {
      addNotification({ type: 'success' });
    }
  });
}
