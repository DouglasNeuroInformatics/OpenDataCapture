import { useNotificationsStore } from '@douglasneuroinformatics/libui/hooks';
import { $Session } from '@opendatacapture/schemas/session';
import type { $StartSessionData } from '@opendatacapture/schemas/session';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

export function useCreateSessionMutation() {
  const addNotification = useNotificationsStore((store) => store.addNotification);
  return useMutation({
    mutationFn: async (data: $StartSessionData) => {
      const response = await axios.post('/v1/sessions', data);
      return $Session.parseAsync(response.data);
    },
    onSuccess() {
      addNotification({ type: 'success' });
    }
  });
}
