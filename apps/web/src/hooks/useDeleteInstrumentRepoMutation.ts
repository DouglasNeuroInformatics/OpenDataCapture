import { useNotificationsStore } from '@douglasneuroinformatics/libui/hooks';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

import { getApiErrorMessage } from '@/utils/error';

import { INSTRUMENT_REPOS_QUERY_KEY } from './useInstrumentReposQuery';

export function useDeleteInstrumentRepoMutation() {
  const queryClient = useQueryClient();
  const addNotification = useNotificationsStore((store) => store.addNotification);
  return useMutation({
    mutationFn: ({ id }: { id: string }) =>
      axios.delete(`/v1/instrument-repos/${id}`, { meta: { disableDefaultErrorNotification: true } }),
    onError(err) {
      addNotification({ message: getApiErrorMessage(err, 'Failed to delete repository'), type: 'error' });
    },
    onSuccess() {
      addNotification({ type: 'success' });
      void queryClient.invalidateQueries({ queryKey: [INSTRUMENT_REPOS_QUERY_KEY] });
      // Deletion reconciles orphaned instruments (some are converted to manual, others hidden);
      // refresh the instrument list shown elsewhere to reflect the change.
      void queryClient.invalidateQueries({ queryKey: ['instrument-info'] });
    }
  });
}
