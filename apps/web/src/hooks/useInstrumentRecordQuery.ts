import { $InstrumentRecord } from '@opendatacapture/schemas/instrument-records';
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import axios from 'axios';

export const instrumentRecordQueryOptions = ({ params }: { params: { id: string } }) => {
  return queryOptions({
    queryFn: async () => {
      const response = await axios.get(`/v1/instrument-records/${params.id}`);
      return $InstrumentRecord.parse(response.data);
    },
    queryKey: ['instrument-records', `id-${params.id}`]
  });
};

export function useInstrumentRecordQuery({ params }: { params: { id: string } }) {
  return useSuspenseQuery(instrumentRecordQueryOptions({ params }));
}
