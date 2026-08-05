import { useNotificationsStore } from '@douglasneuroinformatics/libui/hooks';
import type { UpdateSetupStateData } from '@opendatacapture/schemas/setup';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

import { SETUP_STATE_QUERY_KEY } from './useSetupStateQuery';

type UpdateSetupStateMutationOptions = {
  /** The notification shown when the update succeeds */
  successNotification?: {
    message: string;
    title: string;
  };
  /**
   * Whether a failure replaces the page with the router error boundary, as the app does by default.
   * Set `false` where the save is autosaved rather than submitted: the user did not ask for the
   * navigation, so the failure belongs beside the control they changed.
   */
  throwOnError?: boolean;
};

// Defaulted here rather than left undefined: `useMutation` spreads these over the query client's
// defaults, so an absent key would read as `false` and silently opt every caller out.
export function useUpdateSetupStateMutation({
  successNotification,
  throwOnError = true
}: UpdateSetupStateMutationOptions = {}) {
  const queryClient = useQueryClient();
  const addNotification = useNotificationsStore((store) => store.addNotification);
  return useMutation({
    mutationFn: async (data: UpdateSetupStateData) => {
      await axios.patch('/v1/setup', data);
    },
    onSuccess() {
      if (successNotification) {
        addNotification({
          message: successNotification.message,
          title: successNotification.title,
          type: 'success'
        });
      }
      void queryClient.invalidateQueries({ queryKey: [SETUP_STATE_QUERY_KEY] });
    },
    throwOnError
  });
}
