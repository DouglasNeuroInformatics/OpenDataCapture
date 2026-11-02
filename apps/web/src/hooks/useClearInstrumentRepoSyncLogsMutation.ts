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
    mutationFn: () => {
      return axios.delete('/v1/instrument-repos/sync/logs', { meta: { disableDefaultErrorNotification: true } });
    },
    onError(err) {
      addNotification({
        message: getApiErrorMessage(
          err,
          t({
            en: 'Failed to clear the activity log',
            es: 'Error al borrar el registro de actividad',
            fr: "Échec de l'effacement du journal d'activité"
          })
        ),
        type: 'error'
      });
    },
    onSuccess() {
      addNotification({
        message: t({
          en: 'Activity log cleared',
          es: 'Registro de actividad borrado',
          fr: "Journal d'activité effacé"
        }),
        type: 'success'
      });
      void queryClient.invalidateQueries({ queryKey: [INSTRUMENT_REPO_SYNC_LOGS_QUERY_KEY] });
    },
    // onError reports the failure; the app default would also hand it to the route error boundary.
    throwOnError: false
  });
}
