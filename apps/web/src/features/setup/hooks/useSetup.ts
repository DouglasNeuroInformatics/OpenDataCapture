import { useNotificationsStore } from '@douglasneuroinformatics/ui';
import { $SetupStatus, type InitAppOptions } from '@open-data-capture/common/setup';
import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';

export function useSetup() {
  const notifications = useNotificationsStore();
  const query = useQuery({
    queryFn: async () => {
      const response = await axios.get('/v1/setup');
      const result = await $SetupStatus.safeParseAsync(response.data);
      if (!result.success) {
        throw new Error('Failed to parse setup status', { cause: result.error });
      }
      return result.data;
    },
    queryKey: ['setup-status'],
    throwOnError: true
  });
  const mutation = useMutation({
    mutationFn: async (data: InitAppOptions) => {
      await axios.post('/v1/setup', data);
      notifications.addNotification({ type: 'success' });
      return query.refetch();
    }
  });

  return { mutation, query };
}
