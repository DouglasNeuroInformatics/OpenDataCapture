import { $MailSettings } from '@opendatacapture/schemas/mail';
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import axios from 'axios';

export const MAIL_SETTINGS_QUERY_KEY = 'mail-settings';

export const mailSettingsQueryOptions = () => {
  return queryOptions({
    queryFn: async () => {
      const response = await axios.get('/v1/mail/settings');
      return $MailSettings.parseAsync(response.data);
    },
    queryKey: [MAIL_SETTINGS_QUERY_KEY],
    staleTime: Infinity
  });
};

export function useMailSettingsQuery() {
  return useSuspenseQuery(mailSettingsQueryOptions());
}
