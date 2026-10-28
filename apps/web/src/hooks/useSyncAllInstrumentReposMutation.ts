import { useNotificationsStore, useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { $InstrumentRepoSyncLog } from '@opendatacapture/schemas/instrument-repo';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

import { getApiErrorMessage } from '@/utils/error';

import { INSTRUMENT_REPOS_QUERY_KEY } from './useInstrumentReposQuery';
import { INSTRUMENT_REPO_SYNC_LOGS_QUERY_KEY } from './useInstrumentRepoSyncLogsQuery';

export function useSyncAllInstrumentReposMutation() {
  const queryClient = useQueryClient();
  const addNotification = useNotificationsStore((store) => store.addNotification);
  const { t } = useTranslation();
  return useMutation({
    mutationFn: async () => {
      const response = await axios.post('/v1/instrument-repos/sync/all', undefined, {
        meta: { disableDefaultErrorNotification: true, disableDefaultTimeout: true }
      });
      return $InstrumentRepoSyncLog.array().parse(response.data);
    },
    onError(err) {
      addNotification({
        message: getApiErrorMessage(
          err,
          t({
            en: 'Failed to sync repositories',
            es: 'Error al sincronizar los repositorios',
            fr: 'Échec de la synchronisation des dépôts'
          })
        ),
        type: 'error'
      });
    },
    onMutate() {
      addNotification({
        message: t({
          en: 'Syncing every repository...',
          es: 'Sincronizando todos los repositorios...',
          fr: 'Synchronisation de tous les dépôts...'
        }),
        type: 'info'
      });
    },
    onSettled() {
      void queryClient.invalidateQueries({ queryKey: [INSTRUMENT_REPOS_QUERY_KEY] });
      void queryClient.invalidateQueries({ queryKey: [INSTRUMENT_REPO_SYNC_LOGS_QUERY_KEY] });
      void queryClient.invalidateQueries({ queryKey: ['instrument-info'] });
    },
    onSuccess(logs) {
      const problemCount = logs.filter((log) => log.failures.length > 0 || Boolean(log.message)).length;
      if (problemCount === 0) {
        addNotification({
          message: t({
            en: `Synced ${logs.length} repositories successfully`,
            es: `${logs.length} repositorios sincronizados correctamente`,
            fr: `${logs.length} dépôts synchronisés avec succès`
          }),
          type: 'success'
        });
        return;
      }
      addNotification({
        message: t({
          en: `${problemCount} of ${logs.length} repositories had problems. See the sync history.`,
          es: `${problemCount} de ${logs.length} repositorios tuvieron problemas. Consulte el historial de sincronización.`,
          fr: `${problemCount} dépôts sur ${logs.length} ont rencontré des problèmes. Consultez l'historique de synchronisation.`
        }),
        type: 'warning'
      });
    },
    // onError reports the failure; the app default would also hand it to the route error boundary.
    throwOnError: false
  });
}
