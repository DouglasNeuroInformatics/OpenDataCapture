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
      await axios.post('/v1/instrument-records/upload', {
        ...data,
        records: data.records.map((record) => ({
          ...record,
          data: JSON.parse(JSON.stringify(record.data, replacer)) as Json
        }))
      } satisfies UploadInstrumentRecordsData);
    },
    onSuccess() {
      addNotification({ type: 'success' });
    }
  });
}
