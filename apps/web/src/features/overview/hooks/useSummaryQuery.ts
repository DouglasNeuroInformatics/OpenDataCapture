import { $Summary } from '@opendatacapture/common/summary';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import axios from 'axios';

type UseSummaryQueryOptions = {
  params?: {
    groupId?: string;
  };
};

export const useSummaryQuery = ({ params }: UseSummaryQueryOptions = { params: {} }) => {
  return useQuery({
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
