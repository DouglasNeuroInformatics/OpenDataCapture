import { useNotificationsStore, useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { CreateInstrumentRepoData } from '@opendatacapture/schemas/instrument-repo';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

import { getApiErrorMessage } from '@/utils/error';

import { INSTRUMENT_REPOS_QUERY_KEY } from './useInstrumentReposQuery';

export function useCreateInstrumentRepoMutation() {
  const queryClient = useQueryClient();
  const addNotification = useNotificationsStore((store) => store.addNotification);
  const { t } = useTranslation();
  return useMutation({
    mutationFn: ({ data }: { data: CreateInstrumentRepoData }) =>
      axios.post('/v1/instrument-repos', data, { meta: { disableDefaultErrorNotification: true } }),
    onError(err) {
      addNotification({
        message: getApiErrorMessage(
          err,
          t({
            en: 'Failed to import repository',
            es: 'Error al importar el repositorio',
            fr: "Échec de l'importation du dépôt"
          })
        ),
        type: 'error'
      });
    },
    onSuccess() {
      addNotification({
        message: t({
          en: 'Repository imported successfully',
          es: 'Repositorio importado exitosamente',
          fr: 'Dépôt importé avec succès'
        }),
        type: 'success'
      });
      void queryClient.invalidateQueries({ queryKey: [INSTRUMENT_REPOS_QUERY_KEY] });
      // Importing creates new instruments; refresh the instrument list shown elsewhere (dashboard,
      // manage-group, accessible instruments) so they appear without a hard reload.
      void queryClient.invalidateQueries({ queryKey: ['instrument-info'] });
    }
  });
}
