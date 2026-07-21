import { useNotificationsStore, useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

import { getApiErrorMessage } from '@/utils/error';

export function useDeleteInstrumentMutation() {
  const queryClient = useQueryClient();
  const addNotification = useNotificationsStore((store) => store.addNotification);
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
    onSuccess() {
      addNotification({ type: 'success' });
      // The server has already detached the instrument from every group; callers that hold a stale copy
      // of the group's accessible ids (e.g. the manage page) reconcile it locally via the mutation result.
      void queryClient.invalidateQueries({ queryKey: ['instrument-info'] });
    },
    // The app default is throwOnError: true. mutateAsync still rejects for the caller's try/catch, while
    // this override prevents the mutation's error state from also being thrown during hook rendering.
    throwOnError: false
  });
}
