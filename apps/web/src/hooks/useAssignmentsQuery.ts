import { $Assignment } from '@opendatacapture/schemas/assignment';
import { queryOptions, useQuery } from '@tanstack/react-query';
import axios from 'axios';

export const ASSIGNMENTS_QUERY_KEY_PREFIX = 'assignments' as const;

export const assignmentsQueryOptions = ({ params }: { params?: { groupId?: string; subjectId?: string } } = {}) =>
  queryOptions({
    queryFn: async () => {
      const response = await axios.get('/v1/assignments', { params });
      return $Assignment.array().parse(response.data);
    },
    queryKey: [ASSIGNMENTS_QUERY_KEY_PREFIX, params?.groupId, params?.subjectId]
  });

export function useAssignmentsQuery({ params }: { params?: { groupId?: string; subjectId?: string } }) {
  return useQuery(assignmentsQueryOptions({ params }));
}
