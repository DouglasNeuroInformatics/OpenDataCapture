import { $SubjectRecordSummary } from '@opendatacapture/schemas/instrument-records';
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import axios from 'axios';

type SubjectRecordSummaryQueryParams = {
  groupId?: string;
};

export const subjectRecordSummaryQueryOptions = ({ params }: { params?: SubjectRecordSummaryQueryParams } = {}) => {
  return queryOptions({
    queryFn: async () => {
      const response = await axios.get('/v1/instrument-records/summary/by-subject', { params });
      return $SubjectRecordSummary.array().parse(response.data);
    },
    queryKey: ['subject-record-summary', params?.groupId]
  });
};

export function useSubjectRecordSummaryQuery({ params }: { params?: SubjectRecordSummaryQueryParams } = {}) {
  return useSuspenseQuery(subjectRecordSummaryQueryOptions({ params }));
}
