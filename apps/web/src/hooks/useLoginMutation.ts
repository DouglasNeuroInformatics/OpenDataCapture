import { $AuthPayload, INTERACTIVE_SIGN_IN_HEADER } from '@opendatacapture/schemas/auth';
import type { $LoginCredentials } from '@opendatacapture/schemas/auth';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { z } from 'zod/v4';

const $AccountRefusal = z.object({
  message: z.enum(['Account Archived', 'Account Disabled'])
});

export type LoginResult =
  | { accessToken: string; kind: 'success' }
  | { kind: 'archived' }
  | { kind: 'disabled' }
  | { kind: 'forbidden' }
  | { kind: 'unauthorized' };

/**
 * A refused sign-in is an expected outcome to be shown beside the form, so it is returned as a result
 * rather than thrown to the router error boundary.
 */
export function useLoginMutation({ disableDefaultErrorNotification = false } = {}) {
  return useMutation({
    mutationFn: async (credentials: $LoginCredentials): Promise<LoginResult> => {
      const response = await axios.post<unknown>('/v1/auth/login', credentials, {
        headers: { [INTERACTIVE_SIGN_IN_HEADER]: 'true' },
        // The password dialog signs in while the store still holds the token that expired.
        meta: { disableDefaultAuth: true, disableDefaultErrorNotification },
        validateStatus: (status) => status === 200 || status === 401 || status === 403
      });
      if (response.status === 401) {
        return { kind: 'unauthorized' };
      }
      if (response.status === 403) {
        // Only the API's own two refusals say anything about the account. A 403 from a proxy in
        // front of it does not, and must not be read as the account being disabled.
        const refusal = $AccountRefusal.safeParse(response.data);
        if (!refusal.success) {
          return { kind: 'forbidden' };
        }
        return { kind: refusal.data.message === 'Account Archived' ? 'archived' : 'disabled' };
      }
      return { accessToken: $AuthPayload.parse(response.data).accessToken, kind: 'success' };
    },
    throwOnError: false
  });
}
