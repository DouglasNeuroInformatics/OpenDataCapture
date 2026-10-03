import { useNotificationsStore, useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { $UpdateSeriesInstrumentData } from '@opendatacapture/schemas/instrument';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

import { getApiErrorMessage } from '@/utils/error';

import { SERIES_INSTRUMENTS_OVERVIEW_QUERY_KEY } from './useSeriesInstrumentsOverviewQuery';

/** Archive a series, retiring it from new sessions and assignments, or return it to service. */
export function useUpdateSeriesInstrumentArchiveMutation() {
  const queryClient = useQueryClient();
  const addNotification = useNotificationsStore((store) => store.addNotification);
  const { t } = useTranslation();
  return useMutation({
    mutationFn: ({ id, ...data }: $UpdateSeriesInstrumentData & { id: string }) =>
      axios.patch(`/v1/instruments/series/${id}`, data, { meta: { disableDefaultErrorNotification: true } }),
    onError(err) {
      addNotification({
        message: getApiErrorMessage(
          err,
          t({
            en: 'Failed to update the series instrument',
            es: 'Error al actualizar el instrumento en serie',
            fr: "Échec de la mise à jour de l'instrument en série"
          })
        ),
        type: 'error'
      });
    },
    onSuccess() {
      addNotification({ type: 'success' });
      void queryClient.invalidateQueries({ queryKey: [SERIES_INSTRUMENTS_OVERVIEW_QUERY_KEY] });
      // Every picker filters archived series out of the instrument info, so it must refetch too.
      void queryClient.invalidateQueries({ queryKey: ['instrument-info'] });
    },
    // A refusal is reported by the notification above rather than handed to the route error boundary.
    throwOnError: false
  });
}
