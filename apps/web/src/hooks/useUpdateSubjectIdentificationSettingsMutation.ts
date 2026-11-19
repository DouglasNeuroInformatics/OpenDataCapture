import { $SubjectIdentificationSettings } from '@opendatacapture/schemas/subject-identification';
import type { $UpdateSubjectIdentificationSettingsData } from '@opendatacapture/schemas/subject-identification';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

import { subjectIdentificationSettingsQueryOptions } from './useSubjectIdentificationSettingsQuery';

// The Subject Identification tab says itself why a save failed, so this mutation raises no error
// toast and does not escape to the router error boundary: a failed save must leave the admin on the
// page with their unsaved edits, which means the caller has to see the rejection.
export function useUpdateSubjectIdentificationSettingsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: $UpdateSubjectIdentificationSettingsData) => {
      const response = await axios.put('/v1/subjects/identification/settings', data, {
        meta: { disableDefaultErrorNotification: true }
      });
      return $SubjectIdentificationSettings.parseAsync(response.data);
    },
    onSuccess(data) {
      // Seeded from the response rather than invalidated: the tab decides whether to ask for
      // confirmation from whether a definition is stored, which must be true right after the first save.
      queryClient.setQueryData(subjectIdentificationSettingsQueryOptions().queryKey, data);
    },
    throwOnError: false
  });
}
