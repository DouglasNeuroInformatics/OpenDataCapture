import { useNotificationsStore, useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

import { getApiErrorMessage } from '@/utils/error';

/**
 * Delete a series instrument. Only series may be deleted through this endpoint — the API refuses any
 * scalar instrument, and refuses a series that already has records or assignments — so a rejection here
 * is an expected outcome the user must be told about, not an exceptional one.
 *
 * Failures are reported by the `onError` notification below. Callers that need to react to the outcome
 * should pass per-call callbacks to `mutate` rather than awaiting `mutateAsync`:
 *
 * ```ts
 * mutate({ id }, { onSettled: closeDialog, onSuccess: () => forget(id) });
 * ```
 */
export function useDeleteSeriesInstrumentMutation() {
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
          t({
            en: 'Failed to delete instrument',
            es: 'Error al eliminar el instrumento',
            fr: "Échec de la suppression de l'instrument"
          })
        ),
        type: 'error'
      });
    },
    onSuccess() {
      addNotification({ type: 'success' });
      // The server has already detached the instrument from every group; callers that hold a stale copy
      // of the group's accessible ids (e.g. the manage page) reconcile it locally via onSuccess.
      void queryClient.invalidateQueries({ queryKey: ['instrument-info'] });
    },
    // The app default is throwOnError: true, which would rethrow the error during render and hand a
    // routine "this series still has records" refusal to the route error boundary.
    throwOnError: false
  });
}
