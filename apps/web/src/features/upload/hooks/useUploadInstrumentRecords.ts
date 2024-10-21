import { replacer } from '@douglasneuroinformatics/libjs';
import { useNotificationsStore } from '@douglasneuroinformatics/libui/hooks';
import type { Json } from '@opendatacapture/runtime-core';
import type { UploadInstrumentRecordsData } from '@opendatacapture/schemas/instrument-records';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

export function useUploadInstrumentRecords() {
  const addNotification = useNotificationsStore((store) => store.addNotification);
  return useMutation({
    mutationFn: async (data: UploadInstrumentRecordsData) => {
      const replacedData = JSON.parse(JSON.stringify(data, replacer)) as Json;
      await axios.post('/v1/instrument-records/upload', replacedData);
    },
    onSuccess() {
      addNotification({ type: 'success' });
    }
  });
}
