import { $SubjectCustomIds } from '@opendatacapture/schemas/subject';
import type { SubjectCustomIds } from '@opendatacapture/schemas/subject';
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import axios from 'axios';

type SubjectCustomIdsQueryParams = {
  groupId?: string;
};

/** Without a group there is nothing to suggest, so no request is made and no subjects are listed. */
export const subjectCustomIdsQueryOptions = ({ params }: { params: SubjectCustomIdsQueryParams }) => {
  return queryOptions({
    queryFn: async (): Promise<SubjectCustomIds> => {
      if (!params.groupId) {
        return [];
      }
      const response = await axios.get(`/v1/subjects/groups/${params.groupId}/custom-ids`);
      return $SubjectCustomIds.parse(response.data);
    },
    queryKey: ['subjects', 'custom-ids', params.groupId]
  });
};

export function useSubjectCustomIdsQuery({ params }: { params: SubjectCustomIdsQueryParams }) {
  return useSuspenseQuery(subjectCustomIdsQueryOptions({ params }));
}
