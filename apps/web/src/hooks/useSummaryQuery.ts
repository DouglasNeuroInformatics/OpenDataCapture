import { $Summary } from '@opendatacapture/schemas/summary';
import { keepPreviousData, queryOptions, useQuery } from '@tanstack/react-query';
import axios from 'axios';

type SummaryQueryParams = {
  groupId?: string;
};

export const summaryQueryOptions = ({ params }: { params?: SummaryQueryParams } = {}) => {
  return queryOptions({
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const response = await axios.get('/v1/summary', {
        params
      });
      return $Summary.parse(response.data);
    },
    queryKey: ['summary', params?.groupId]
  });
};

export const useSummaryQuery = ({ params }: { params?: SummaryQueryParams } = {}) => {
  return useQuery(summaryQueryOptions({ params }));
};
