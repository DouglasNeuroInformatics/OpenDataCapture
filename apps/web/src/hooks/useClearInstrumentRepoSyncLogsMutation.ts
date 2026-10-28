import { useNotificationsStore, useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

import { getApiErrorMessage } from '@/utils/error';

import { INSTRUMENT_REPO_SYNC_LOGS_QUERY_KEY } from './useInstrumentRepoSyncLogsQuery';

export function useClearInstrumentRepoSyncLogsMutation() {
  const queryClient = useQueryClient();
  const addNotification = useNotificationsStore((store) => store.addNotification);
  const { t } = useTranslation();
  return useMutation({
    mutationFn: () =>
      axios.delete('/v1/instrument-repos/sync/logs', { meta: { disableDefaultErrorNotification: true } }),
    onError(err) {
      addNotification({
        message: getApiErrorMessage(
          err,
          t({
            en: 'Failed to clear the sync history',
            es: 'Error al borrar el historial de sincronización',
            fr: "Échec de l'effacement de l'historique de synchronisation"
          })
        ),
        type: 'error'
      });
    },
    onSuccess() {
      addNotification({
        message: t({
          en: 'Sync history cleared',
          es: 'Historial de sincronización borrado',
          fr: 'Historique de synchronisation effacé'
        }),
        type: 'success'
      });
      void queryClient.invalidateQueries({ queryKey: [INSTRUMENT_REPO_SYNC_LOGS_QUERY_KEY] });
    },
    // onError reports the failure; the app default would also hand it to the route error boundary.
    throwOnError: false
  });
}
