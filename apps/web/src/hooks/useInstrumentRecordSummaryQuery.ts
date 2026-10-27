import { $InstrumentRecordSummary } from '@opendatacapture/schemas/instrument-records';
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import axios from 'axios';

type InstrumentRecordSummaryQueryParams = {
  /** Count what each series orchestrated instead of what each scalar instrument collected */
  bySeries?: boolean;
  groupId?: string;
};

export const instrumentRecordSummaryQueryOptions = ({
  params
}: { params?: InstrumentRecordSummaryQueryParams } = {}) => {
  return queryOptions({
    queryFn: async () => {
      const path = params?.bySeries ? 'by-series' : 'by-instrument';
      const response = await axios.get(`/v1/instrument-records/summary/${path}`, {
        params: { groupId: params?.groupId }
      });
      return $InstrumentRecordSummary.array().parse(response.data);
    },
    queryKey: ['instrument-record-summary', params?.groupId, params?.bySeries ?? false]
  });
};

export function useInstrumentRecordSummaryQuery({ params }: { params?: InstrumentRecordSummaryQueryParams } = {}) {
  return useSuspenseQuery(instrumentRecordSummaryQueryOptions({ params }));
}
