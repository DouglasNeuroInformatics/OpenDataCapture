import { useNotificationsStore } from '@douglasneuroinformatics/libui/hooks';
import type { UploadInstrumentRecordsData } from '@opendatacapture/schemas/instrument-records';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { replacer } from '@douglasneuroinformatics/libjs';

export function useUploadInstrumentRecords() {
  const addNotification = useNotificationsStore((store) => store.addNotification);
  return useMutation({
    mutationFn: async (data: UploadInstrumentRecordsData) => {
      const replacedData = JSON.parse(JSON.stringify(data, replacer));
      await axios.post('/v1/instrument-records/upload', replacedData);
    },
    onSuccess() {
      addNotification({ type: 'success' });
    }
  });
}
