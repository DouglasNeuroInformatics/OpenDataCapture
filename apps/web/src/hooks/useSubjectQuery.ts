import { $Subject } from '@opendatacapture/schemas/subject';
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import axios from 'axios';

type SubjectQueryParams = {
  id: string;
};

export const subjectQueryOptions = ({ params }: { params: SubjectQueryParams }) => {
  return queryOptions({
    queryFn: async () => {
      const response = await axios.get(`/v1/subjects/${params.id}`, { params });
      return $Subject.parseAsync(response.data);
    },
    queryKey: ['subjects', `id-${params.id}`]
  });
};

export function useSubjectQuery({ params }: { params: SubjectQueryParams }) {
  return useSuspenseQuery(subjectQueryOptions({ params }));
}
