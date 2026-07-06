import { useNotificationsStore, useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { ScalarInstrumentInternal } from '@opendatacapture/runtime-core';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

import { getApiErrorMessage } from '@/utils/error';

type CreateSeriesInstrumentInput = {
  confirmDuplicate?: boolean;
  description?: string;
  instructions?: string;
  items: ScalarInstrumentInternal[];
  title: string;
};

// The server either creates the instrument (returning it with an id) or, when another series already
// contains the same forms and creation was not confirmed, asks the client to confirm the duplicate.
type SeriesDuplicateConfirmation = {
  existingTitle: string;
  requiresConfirmation: true;
};
type CreateSeriesInstrumentResponse = SeriesDuplicateConfirmation | { id: string };

export function isSeriesDuplicateConfirmation(
  response: CreateSeriesInstrumentResponse
): response is SeriesDuplicateConfirmation {
  return 'requiresConfirmation' in response && response.requiresConfirmation;
}

export function useCreateSeriesInstrumentMutation() {
  const queryClient = useQueryClient();
  const addNotification = useNotificationsStore((store) => store.addNotification);
  const { t } = useTranslation();
  return useMutation({
    mutationFn: async (data: CreateSeriesInstrumentInput) => {
      const response = await axios.post<CreateSeriesInstrumentResponse>('/v1/instruments/series', data, {
        meta: { disableDefaultErrorNotification: true }
      });
      return response.data;
    },
    onError(err) {
      addNotification({
        message: getApiErrorMessage(
          err,
          t({ en: 'Failed to create series instrument', fr: "Échec de la création de l'instrument en série" })
        ),
        type: 'error'
      });
    },
    onSuccess(data) {
      // A confirmation prompt is not a creation: do not announce success or refresh the list yet.
      if (isSeriesDuplicateConfirmation(data)) {
        return;
      }
      addNotification({ type: 'success' });
      void queryClient.invalidateQueries({ queryKey: ['instrument-info'] });
    }
  });
}
