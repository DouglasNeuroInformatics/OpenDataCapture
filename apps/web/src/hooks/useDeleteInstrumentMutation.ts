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
    // Callers catch mutateAsync failures and this hook presents the API message as a notification.
    // Do not also rethrow the same handled error into the route error boundary.
    throwOnError: false
  });
}
