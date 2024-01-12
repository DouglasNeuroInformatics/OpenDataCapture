import { useNotificationsStore } from '@douglasneuroinformatics/ui';
import { type InitAppOptions } from '@open-data-capture/common/setup';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

export function useInitApp() {
  const queryClient = useQueryClient();
  const { addNotification } = useNotificationsStore();
  return useMutation({
    mutationFn: (data: InitAppOptions) => axios.post('/v1/setup', data),
    onSuccess() {
      addNotification({ type: 'success' });
      void queryClient.invalidateQueries({ queryKey: ['setup-state'] });
    }
  });
}
