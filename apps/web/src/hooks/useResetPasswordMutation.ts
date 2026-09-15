import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

/**
 * Set the current user's own password through the same endpoint the profile page uses, which is what
 * clears `mustResetPassword`. Separate from `useSelfUpdateUserMutation` only in its error handling:
 * a rejected password is an expected outcome to be shown beside the field, not something for the
 * router error boundary or a generic notification.
 */
export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: async ({ id, password }: { id: string; password: string }) => {
      await axios.patch(
        `/v1/users/self-update/${id}`,
        { password },
        { meta: { disableDefaultErrorNotification: true } }
      );
    },
    throwOnError: false
  });
}
