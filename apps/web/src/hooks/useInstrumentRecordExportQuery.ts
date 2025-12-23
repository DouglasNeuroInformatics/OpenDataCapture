import type { InstrumentRecordsExport } from '@opendatacapture/schemas/instrument-records';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export const useInstrumentRecordsExportQuery = (groupId?: string) => {
  return useQuery({
    queryKey: ['instrument-records-export', groupId],
    enabled: !!groupId,
    queryFn: async () => {
      const { data } = await axios.get<InstrumentRecordsExport>('/v1/instrument-records/export', {
        params: { groupId }
      });
      return data;
    }
  });
};
