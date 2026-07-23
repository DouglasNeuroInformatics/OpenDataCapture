import { useNotificationsStore, useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

import { getApiErrorMessage } from '@/utils/error';

import { INSTRUMENT_REPOS_QUERY_KEY } from './useInstrumentReposQuery';

export function useSyncInstrumentRepoMutation() {
  const queryClient = useQueryClient();
  const addNotification = useNotificationsStore((store) => store.addNotification);
  const { t } = useTranslation();
  return useMutation({
    mutationFn: ({ id }: { id: string }) =>
      axios.post(`/v1/instrument-repos/${id}/sync`, undefined, { meta: { disableDefaultErrorNotification: true } }),
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
          es: 'Sincronizando repositorio...',
          fr: 'Synchronisation du dépôt...'
        }),
        type: 'info'
      });
    },
    onSuccess() {
      addNotification({
        message: t({
          en: 'Repository synced successfully',
          es: 'Repositorio sincronizado exitosamente',
          fr: 'Dépôt synchronisé avec succès'
        }),
        type: 'success'
      });
      void queryClient.invalidateQueries({ queryKey: [INSTRUMENT_REPOS_QUERY_KEY] });
      // A sync can pull in new instruments; refresh the instrument list shown elsewhere.
      void queryClient.invalidateQueries({ queryKey: ['instrument-info'] });
    }
  });
}
