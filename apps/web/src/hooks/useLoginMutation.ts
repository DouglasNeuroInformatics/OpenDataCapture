import { INTERACTIVE_SIGN_IN_HEADER } from '@opendatacapture/schemas/auth';
import type { $LoginCredentials, AuthPayload } from '@opendatacapture/schemas/auth';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

export type LoginResult =
  | { accessToken: string; kind: 'success' }
  | { kind: 'archived' }
  | { kind: 'disabled' }
  | { kind: 'unauthorized' };

/**
 * A refused sign-in is an expected outcome to be shown beside the form, so it is returned as a result
 * rather than thrown to the router error boundary.
 */
export function useLoginMutation({ disableDefaultErrorNotification = false } = {}) {
  return useMutation({
    mutationFn: async (credentials: $LoginCredentials): Promise<LoginResult> => {
      const response = await axios.post<AuthPayload>('/v1/auth/login', credentials, {
        headers: { [INTERACTIVE_SIGN_IN_HEADER]: 'true' },
        // The password dialog signs in while the store still holds the token that expired.
        meta: { disableDefaultAuth: true, disableDefaultErrorNotification },
        validateStatus: (status) => status === 200 || status === 401 || status === 403
      });
      if (response.status === 403) {
        const message = (response.data as { message?: string }).message;
        return { kind: message === 'Account Archived' ? 'archived' : 'disabled' };
      }
      if (response.status === 401) {
        return { kind: 'unauthorized' };
      }
      return { accessToken: response.data.accessToken, kind: 'success' };
    },
    throwOnError: false
  });
}
