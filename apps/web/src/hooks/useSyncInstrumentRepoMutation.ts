import { useNotificationsStore } from '@douglasneuroinformatics/libui/hooks';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

import { getApiErrorMessage } from '@/utils/error';

import { INSTRUMENT_REPOS_QUERY_KEY } from './useInstrumentReposQuery';

export function useSyncInstrumentRepoMutation() {
  const queryClient = useQueryClient();
  const addNotification = useNotificationsStore((store) => store.addNotification);
  return useMutation({
    mutationFn: ({ id }: { id: string }) =>
      axios.post(`/v1/instrument-repos/${id}/sync`, undefined, { meta: { disableDefaultErrorNotification: true } }),
    onError(err) {
      addNotification({ message: getApiErrorMessage(err, 'Failed to sync repository'), type: 'error' });
    },
    onMutate() {
      // Immediate feedback that the (potentially slow) sync has started.
      addNotification({ message: 'Syncing repository...', type: 'info' });
    },
    onSuccess() {
      addNotification({ message: 'Repository synced successfully', type: 'success' });
      void queryClient.invalidateQueries({ queryKey: [INSTRUMENT_REPOS_QUERY_KEY] });
      // A sync can pull in new instruments; refresh the instrument list shown elsewhere.
      void queryClient.invalidateQueries({ queryKey: ['instrument-info'] });
    }
  });
}
