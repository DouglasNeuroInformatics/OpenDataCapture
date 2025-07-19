import { $Subject } from '@opendatacapture/schemas/subject';
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import axios from 'axios';

type SubjectsQueryParams = {
  groupId?: string;
};

export const subjectsQueryOptions = ({ params }: { params?: SubjectsQueryParams } = {}) => {
  return queryOptions({
    queryFn: async () => {
      const response = await axios.get('/v1/subjects', { params });
      return $Subject.array().parse(response.data);
    },
    queryKey: ['subjects', params?.groupId]
  });
};

export function useSubjectsQuery({ params }: { params?: SubjectsQueryParams } = {}) {
  return useSuspenseQuery(subjectsQueryOptions({ params }));
}
