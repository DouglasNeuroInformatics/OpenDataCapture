import { useNotificationsStore } from '@douglasneuroinformatics/libui/hooks';
import { type InitAppOptions } from '@opendatacapture/schemas/setup';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

export function useCreateSetupState() {
  const queryClient = useQueryClient();
  const addNotification = useNotificationsStore((store) => store.addNotification);
  return useMutation({
    mutationFn: (data: InitAppOptions) => axios.post('/v1/setup', data),
    onSuccess() {
      addNotification({ type: 'success' });
      void queryClient.invalidateQueries({ queryKey: ['setup-state'] });
    }
  });
}
