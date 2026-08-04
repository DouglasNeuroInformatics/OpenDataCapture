import { useNotificationsStore } from '@douglasneuroinformatics/libui/hooks';
import { $Group } from '@opendatacapture/schemas/group';
import type { UpdateGroupData } from '@opendatacapture/schemas/group';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

import { useAppStore } from '@/store';

type UpdateGroupMutationOptions = {
  /** Whether a success toast is raised. Opt out where the caller renders its own save feedback. */
  successNotification?: boolean;
  /**
   * Whether a rejected update escapes to the router error boundary. Opt out where the caller
   * must stay on the page to recover — a save conflict, for instance.
   */
  throwOnError?: boolean;
};

export function useUpdateGroupMutation({
  successNotification = true,
  throwOnError = true
}: UpdateGroupMutationOptions = {}) {
  const addNotification = useNotificationsStore((store) => store.addNotification);
  const currentGroup = useAppStore((store) => store.currentGroup);
  return useMutation({
    mutationFn: async (data: UpdateGroupData) => {
      // A caller that opts out of throwing is declaring it renders its own failure feedback, so
      // the interceptor's generic error toast would double it; the default path keeps the toast.
      const response = await axios.patch(`/v1/groups/${currentGroup?.id}`, data, {
        meta: { disableDefaultErrorNotification: !throwOnError }
      });
      return $Group.parseAsync(response.data);
    },
    onSuccess() {
      if (successNotification) {
        addNotification({ type: 'success' });
      }
    },
    throwOnError
  });
}
