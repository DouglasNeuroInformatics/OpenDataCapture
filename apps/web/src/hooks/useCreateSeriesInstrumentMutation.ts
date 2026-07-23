import { useNotificationsStore, useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { $CreateSeriesInstrumentData, CreateSeriesInstrumentResult } from '@opendatacapture/schemas/instrument';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

import { getApiErrorMessage } from '@/utils/error';

// The request/response contract is shared with the server (`@opendatacapture/schemas/instrument`) so the
// two cannot drift: `$CreateSeriesInstrumentData` is the request body and `CreateSeriesInstrumentResult`
// is a discriminated union over `outcome` (either the series was created, or the caller must confirm a
// duplicate before it is).
export function useCreateSeriesInstrumentMutation() {
  const queryClient = useQueryClient();
  const addNotification = useNotificationsStore((store) => store.addNotification);
  const { t } = useTranslation();
  return useMutation({
    mutationFn: async (data: $CreateSeriesInstrumentData) => {
      const response = await axios.post<CreateSeriesInstrumentResult>('/v1/instruments/series', data, {
        meta: { disableDefaultErrorNotification: true }
      });
      return response.data;
    },
    onError(err) {
      addNotification({
        message: getApiErrorMessage(
          err,
          t({
            en: 'Failed to create series instrument',
            es: 'Error al crear el instrumento en serie',
            fr: "Échec de la création de l'instrument en série"
          })
        ),
        type: 'error'
      });
    },
    onSuccess(data) {
      // A duplicate prompt is not a creation: do not announce success or refresh the list yet.
      if (data.outcome === 'duplicate') {
        return;
      }
      addNotification({ type: 'success' });
      void queryClient.invalidateQueries({ queryKey: ['instrument-info'] });
    }
  });
}
