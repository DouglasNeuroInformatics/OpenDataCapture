import { useCallback } from 'react';

import { $SubjectDemographics } from '@opendatacapture/schemas/subject';
import type { SubjectDemographics } from '@opendatacapture/schemas/subject';
import { queryOptions, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

type SubjectDemographicsQueryParams = {
  id: string;
};

/** Resolves to `null` for an id no subject has yet, which is an expected answer rather than an error. */
export const subjectDemographicsQueryOptions = ({ params }: { params: SubjectDemographicsQueryParams }) => {
  return queryOptions({
    queryFn: async (): Promise<null | SubjectDemographics> => {
      const response = await axios.get(`/v1/subjects/${encodeURIComponent(params.id)}`, {
        validateStatus: (status) => status === 200 || status === 404
      });
      return response.status === 404 ? null : $SubjectDemographics.parse(response.data);
    },
    queryKey: ['subjects', 'demographics', params.id]
  });
};

export function useSubjectDemographicsLookup() {
  const queryClient = useQueryClient();
  return useCallback(
    (id: string) => queryClient.fetchQuery(subjectDemographicsQueryOptions({ params: { id } })),
    [queryClient]
  );
}
