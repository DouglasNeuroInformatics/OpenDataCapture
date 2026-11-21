import { $SubjectIdentificationCounts } from '@opendatacapture/schemas/subject-identification';
import { queryOptions, useQuery } from '@tanstack/react-query';
import axios from 'axios';

export const subjectIdentificationCountsQueryOptions = () => {
  return queryOptions({
    queryFn: async () => {
      const response = await axios.get('/v1/subjects/identification/counts');
      return $SubjectIdentificationCounts.parseAsync(response.data);
    },
    queryKey: ['subject-identification-counts']
  });
};

/** Fetched only while `isEnabled`, which is while an administrator is about to turn a method off. */
export function useSubjectIdentificationCountsQuery({ isEnabled }: { isEnabled: boolean }) {
  return useQuery({ ...subjectIdentificationCountsQueryOptions(), enabled: isEnabled });
}
