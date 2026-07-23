import type { MailSettings, UpdateMailSettingsData } from '@opendatacapture/schemas/mail';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

import { MAIL_SETTINGS_QUERY_KEY } from './useMailSettingsQuery';
import { SETUP_STATE_QUERY_KEY } from './useSetupStateQuery';

// The mail page autosaves and shows its own inline "saving/saved" status, so this mutation
// does not raise a toast on success — it only keeps the cached queries in sync.
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
    }
  });
}
