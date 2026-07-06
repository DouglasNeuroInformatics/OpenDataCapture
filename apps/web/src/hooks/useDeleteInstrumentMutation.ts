import { useNotificationsStore, useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

import { useAppStore } from '@/store';
import { getApiErrorMessage } from '@/utils/error';

export function useDeleteInstrumentMutation() {
  const queryClient = useQueryClient();
  const addNotification = useNotificationsStore((store) => store.addNotification);
  const pruneDeletedInstrument = useAppStore((store) => store.pruneDeletedInstrument);
  const { t } = useTranslation();
  return useMutation({
    mutationFn: ({ id }: { id: string }) =>
      axios.delete(`/v1/instruments/${id}`, { meta: { disableDefaultErrorNotification: true } }),
    onError(err) {
      addNotification({
        message: getApiErrorMessage(
          err,
          t({ en: 'Failed to delete instrument', fr: "Échec de la suppression de l'instrument" })
        ),
        type: 'error'
      });
    },
    onSuccess(_, { id }) {
      addNotification({ type: 'success' });
      // Drop the deleted id from the cached group so the manage page does not re-send it on save.
      pruneDeletedInstrument(id);
      void queryClient.invalidateQueries({ queryKey: ['instrument-info'] });
    }
  });
}
