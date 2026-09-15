import { $Assignment } from '@opendatacapture/schemas/assignment';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export const ASSIGNMENTS_QUERY_KEY_PREFIX = 'assignments' as const;

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
    queryKey: [ASSIGNMENTS_QUERY_KEY_PREFIX, params?.subjectId]
  });
}
