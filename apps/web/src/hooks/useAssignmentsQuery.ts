import { $Assignment } from '@opendatacapture/schemas/assignment';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export function useAssignmentsQuery({ params }: { params?: { subjectId?: string } }) {
  return useQuery({
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
