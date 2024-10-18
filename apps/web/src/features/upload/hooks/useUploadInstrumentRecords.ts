import { useNotificationsStore } from '@douglasneuroinformatics/libui/hooks';
import type { UploadInstrumentRecordsData } from '@opendatacapture/schemas/instrument-records';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

export function useUploadInstrumentRecords() {
  const addNotification = useNotificationsStore((store) => store.addNotification);
  return useMutation({
    mutationFn: async (data: UploadInstrumentRecordsData) => {
      await axios.post('/v1/instrument-records/upload', data);
    },
    onSuccess() {
      addNotification({ type: 'success' });
    }
  });
}
