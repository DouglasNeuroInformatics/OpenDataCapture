import { useNotificationsStore } from '@douglasneuroinformatics/libui/hooks';
import { $Session, type CreateSessionData } from '@opendatacapture/schemas/session';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

export function useCreateSession() {
  const { addNotification } = useNotificationsStore();
  return useMutation({
    mutationFn: async (data: CreateSessionData) => {
      const response = await axios.post('/v1/sessions', data);
      return $Session.parseAsync(response.data);
    },
    onSuccess() {
      addNotification({ type: 'success' });
    }
  });
}
