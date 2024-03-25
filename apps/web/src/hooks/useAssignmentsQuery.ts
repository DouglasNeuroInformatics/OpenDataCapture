import { $Assignment } from '@open-data-capture/schemas/assignment';
import { useSuspenseQuery } from '@tanstack/react-query';
import axios from 'axios';

export function useAssignmentsQuery({ params }: { params?: { subjectId?: string } }) {
  return useSuspenseQuery({
    queryFn: async () => {
      const response = await axios.get('/v1/assignments', {
        params: {
          subjectId: params?.subjectId
        }
      });
      return $Assignment.array().parse(response.data);
    },
    queryKey: ['assignments', params?.subjectId]
  });
}
