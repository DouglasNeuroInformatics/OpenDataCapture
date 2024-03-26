import { $InstrumentRecord, type InstrumentRecordQueryParams } from '@opendatacapture/schemas/instrument-records';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

type UseInstrumentRecordsOptions = {
  enabled?: boolean;
  params: InstrumentRecordQueryParams;
};

export const useInstrumentRecords = (
  { enabled, params }: UseInstrumentRecordsOptions = {
    enabled: true,
    params: {}
  }
) => {
  return useQuery({
    enabled,
    queryFn: async () => {
      const response = await axios.get('/v1/instrument-records', {
        params
      });
      return $InstrumentRecord.array().parseAsync(response.data);
    },
    queryKey: ['instrument-records', ...Object.values(params)]
  });
};
