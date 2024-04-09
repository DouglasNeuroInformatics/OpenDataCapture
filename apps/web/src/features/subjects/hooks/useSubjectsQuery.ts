import { $Subject } from '@opendatacapture/schemas/subject';
import { useSuspenseQuery } from '@tanstack/react-query';
import axios from 'axios';

type UseSubjectsQueryOptions = {
  params: {
    groupId?: string;
  };
};

export function useSubjectsQuery({ params }: UseSubjectsQueryOptions) {
  return useSuspenseQuery({
    queryFn: async () => {
      const response = await axios.get('/v1/subjects', { params });
      return $Subject.array().parse(response.data);
    },
    queryKey: ['subjects', params.groupId]
  });
}
