import { $SubjectCustomIds } from '@opendatacapture/schemas/subject';
import type { SubjectCustomIds } from '@opendatacapture/schemas/subject';
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import axios from 'axios';

type SubjectCustomIdsQueryParams = {
  groupId?: string;
};

/**
 * Without a group, a session's custom ID is scoped to the default group, so the matching suggestions
 * are the subjects whose id carries that scope rather than those of any particular group.
 */
export const subjectCustomIdsQueryOptions = ({ params }: { params: SubjectCustomIdsQueryParams }) => {
  return queryOptions({
    queryFn: async (): Promise<SubjectCustomIds> => {
      const url = params.groupId
        ? `/v1/subjects/groups/${params.groupId}/custom-ids`
        : '/v1/subjects/default-group/custom-ids';
      const response = await axios.get(url);
      return $SubjectCustomIds.parse(response.data);
    },
    queryKey: ['subjects', 'custom-ids', params.groupId]
  });
};

export function useSubjectCustomIdsQuery({ params }: { params: SubjectCustomIdsQueryParams }) {
  return useSuspenseQuery(subjectCustomIdsQueryOptions({ params }));
}
