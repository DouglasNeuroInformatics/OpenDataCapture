import { useNotificationsStore } from '@douglasneuroinformatics/libui/hooks';
import type { CreateInstrumentRepoData } from '@opendatacapture/schemas/instrument-repo';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

import { getApiErrorMessage } from '@/utils/error';

import { INSTRUMENT_REPOS_QUERY_KEY } from './useInstrumentReposQuery';

export function useCreateInstrumentRepoMutation() {
  const queryClient = useQueryClient();
  const addNotification = useNotificationsStore((store) => store.addNotification);
  return useMutation({
    mutationFn: ({ data }: { data: CreateInstrumentRepoData }) =>
      axios.post('/v1/instrument-repos', data, { meta: { disableDefaultErrorNotification: true } }),
    onError(err) {
      addNotification({ message: getApiErrorMessage(err, 'Failed to import repository'), type: 'error' });
    },
    onSuccess() {
      addNotification({ message: 'Repository imported successfully', type: 'success' });
      void queryClient.invalidateQueries({ queryKey: [INSTRUMENT_REPOS_QUERY_KEY] });
      // Importing creates new instruments; refresh the instrument list shown elsewhere (dashboard,
      // manage-group, accessible instruments) so they appear without a hard reload.
      void queryClient.invalidateQueries({ queryKey: ['instrument-info'] });
    }
  });
}
