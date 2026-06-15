import { $InstrumentRecordFiles } from '@opendatacapture/schemas/instrument-records';
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import axios from 'axios';

export const instrumentRecordFilesQueryOptions = ({ params }: { params: { id: string } }) => {
  return queryOptions({
    queryFn: async () => {
      const response = await axios.get(`/v1/instrument-records/${params.id}/files`);
      return $InstrumentRecordFiles.parse(response.data);
    },
    queryKey: ['instrument-records', `id-${params.id}`, 'files']
  });
};

export function useInstrumentRecordFilesQuery({ params }: { params: { id: string } }) {
  return useSuspenseQuery(instrumentRecordFilesQueryOptions({ params }));
}
