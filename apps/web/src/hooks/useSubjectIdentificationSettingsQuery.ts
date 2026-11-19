import { $SubjectIdentificationSettings } from '@opendatacapture/schemas/subject-identification';
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import axios from 'axios';

const SUBJECT_IDENTIFICATION_SETTINGS_QUERY_KEY = 'subject-identification-settings';

export const subjectIdentificationSettingsQueryOptions = () => {
  return queryOptions({
    queryFn: async () => {
      const response = await axios.get('/v1/subjects/identification/settings');
      return $SubjectIdentificationSettings.parseAsync(response.data);
    },
    queryKey: [SUBJECT_IDENTIFICATION_SETTINGS_QUERY_KEY]
  });
};

export function useSubjectIdentificationSettingsQuery() {
  return useSuspenseQuery(subjectIdentificationSettingsQueryOptions());
}
