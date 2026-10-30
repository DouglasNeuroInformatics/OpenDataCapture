import { useNotificationsStore, useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { $InstrumentRepoSyncLog } from '@opendatacapture/schemas/instrument-repo';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

import { getApiErrorMessage } from '@/utils/error';

import { INSTRUMENT_REPOS_QUERY_KEY } from './useInstrumentReposQuery';
import { INSTRUMENT_REPO_SYNC_LOGS_QUERY_KEY } from './useInstrumentRepoSyncLogsQuery';

export function useSyncInstrumentRepoMutation() {
  const queryClient = useQueryClient();
  const addNotification = useNotificationsStore((store) => store.addNotification);
  const { t } = useTranslation();
  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const response = await axios.post(`/v1/instrument-repos/${id}/sync`, undefined, {
        meta: { disableDefaultErrorNotification: true, disableDefaultTimeout: true }
      });
      return $InstrumentRepoSyncLog.parse(response.data);
    },
    onError(err) {
      addNotification({
        message: getApiErrorMessage(
          err,
          t({
            en: 'Failed to sync repository',
            es: 'Error al sincronizar el repositorio',
            fr: 'Échec de la synchronisation du dépôt'
          })
        ),
        type: 'error'
      });
    },
    onMutate() {
      // Immediate feedback that the (potentially slow) sync has started.
      addNotification({
        message: t({
          en: 'Syncing repository...',
          es: 'Sincronizando el repositorio...',
          fr: 'Synchronisation du dépôt...'
        }),
        type: 'info'
      });
    },
    onSettled() {
      // A failed sync is logged too, so the history changes either way.
      void queryClient.invalidateQueries({ queryKey: [INSTRUMENT_REPO_SYNC_LOGS_QUERY_KEY] });
    },
    onSuccess(log) {
      const failedCount = log.failures.length;
      addNotification(
        failedCount
          ? {
              message: t({
                en: `Repository synced, but ${failedCount} instruments failed. See the activity log.`,
                es: `Repositorio sincronizado, pero ${failedCount} instrumentos fallaron. Consulte el registro de actividad.`,
                fr: `Dépôt synchronisé, mais ${failedCount} instruments ont échoué. Consultez le journal d'activité.`
              }),
              type: 'warning'
            }
          : {
              message: t({
                en: 'Repository synced successfully',
                es: 'Repositorio sincronizado correctamente',
                fr: 'Dépôt synchronisé avec succès'
              }),
              type: 'success'
            }
      );
      void queryClient.invalidateQueries({ queryKey: [INSTRUMENT_REPOS_QUERY_KEY] });
      // A sync can pull in new instruments; refresh the instrument list shown elsewhere.
      void queryClient.invalidateQueries({ queryKey: ['instrument-info'] });
    },
    // onError reports the failure; the app default would also hand it to the route error boundary.
    throwOnError: false
  });
}
