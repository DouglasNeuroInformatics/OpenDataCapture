import { useNotificationsStore } from '@douglasneuroinformatics/libui/hooks';
import { PASSWORD_ERROR_CODES } from '@opendatacapture/schemas/user';
import type { CreateUserData, PasswordErrorCode } from '@opendatacapture/schemas/user';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios, { isAxiosError } from 'axios';

import { USERS_QUERY_KEY } from './useUsersQuery';

/** The outcome of attempting to create a user, so the caller can localize any rejection. */
type CreateUserResult = { code: null | PasswordErrorCode; success: false } | { success: true };

/** Read a known password error code from an API error response body, if present. */
function parsePasswordErrorCode(data: unknown): null | PasswordErrorCode {
  if (typeof data === 'object' && data !== null && 'code' in data && typeof data.code === 'string') {
    return (PASSWORD_ERROR_CODES as readonly string[]).includes(data.code) ? (data.code as PasswordErrorCode) : null;
  }
  return null;
}

export function useCreateUserMutation() {
  const queryClient = useQueryClient();
  const addNotification = useNotificationsStore((store) => store.addNotification);
  return useMutation({
    // The default error notification is disabled so the caller can translate the structured
    // error code returned by the API (e.g. a rejected password) into a localized message.
    mutationFn: async ({ data }: { data: CreateUserData }): Promise<CreateUserResult> => {
      try {
        await axios.post('/v1/users', data, { meta: { disableDefaultErrorNotification: true } });
        return { success: true };
      } catch (err) {
        if (isAxiosError(err) && err.response?.status === 400) {
          return { code: parsePasswordErrorCode(err.response.data), success: false };
        }
        // An unexpected error (network failure, 5xx, etc.); surface it generically.
        console.error(err);
        return { code: null, success: false };
      }
    },
    onSuccess(result) {
      if (result.success) {
        addNotification({ type: 'success' });
        void queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
      }
    }
  });
}
