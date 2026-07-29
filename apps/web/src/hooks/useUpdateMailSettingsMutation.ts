import type { MailSettings, UpdateMailSettingsData } from '@opendatacapture/schemas/mail';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

import { MAIL_SETTINGS_QUERY_KEY } from './useMailSettingsQuery';
import { SETUP_STATE_QUERY_KEY } from './useSetupStateQuery';

// The mail page renders its own inline save feedback, so this mutation raises neither a success
// nor an error toast and does not escape to the router error boundary. `throwOnError: false`
// overrides the global mutation default deliberately: a failed save must leave the admin on the
// page with their unsaved edits intact, which means the caller has to see the rejection.
export function useUpdateMailSettingsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: UpdateMailSettingsData) => {
      const response = await axios.patch<MailSettings>('/v1/mail/settings', data, {
        meta: { disableDefaultErrorNotification: true }
      });
      return response.data;
    },
    onSuccess() {
      void queryClient.invalidateQueries({ queryKey: [MAIL_SETTINGS_QUERY_KEY] });
      // Toggling `enabled` changes the public `isMailEnabled` flag, which gates email UI elsewhere.
      void queryClient.invalidateQueries({ queryKey: [SETUP_STATE_QUERY_KEY] });
    },
    throwOnError: false
  });
}
