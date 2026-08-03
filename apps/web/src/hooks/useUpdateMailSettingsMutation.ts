import { $MailSettings } from '@opendatacapture/schemas/mail';
import type { UpdateMailSettingsData } from '@opendatacapture/schemas/mail';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

import { mailSettingsQueryOptions } from './useMailSettingsQuery';
import { SETUP_STATE_QUERY_KEY } from './useSetupStateQuery';

// The mail page renders its own inline save feedback, so this mutation raises neither a success
// nor an error toast and does not escape to the router error boundary. `throwOnError: false`
// overrides the global mutation default deliberately: a failed save must leave the admin on the
// page with their unsaved edits intact, which means the caller has to see the rejection.
export function useUpdateMailSettingsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: UpdateMailSettingsData) => {
      const response = await axios.patch('/v1/mail/settings', data, {
        meta: { disableDefaultErrorNotification: true }
      });
      return $MailSettings.parseAsync(response.data);
    },
    onSuccess(data) {
      // Seed from the response rather than invalidating: the settings page reads its `config`
      // from this query, and an action taken right after a save (e.g. toggling mail off) must
      // see the saved server, not the pre-refetch copy.
      queryClient.setQueryData(mailSettingsQueryOptions().queryKey, data);
      // Toggling `enabled` changes the public `isMailEnabled` flag, which gates email UI elsewhere.
      void queryClient.invalidateQueries({ queryKey: [SETUP_STATE_QUERY_KEY] });
    },
    throwOnError: false
  });
}
