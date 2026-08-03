import type { Language } from '@opendatacapture/schemas/core';
import { MAIL_CLIENT_TIMEOUT } from '@opendatacapture/schemas/mail';
import { $CreateUserResponse } from '@opendatacapture/schemas/user';
import type { CreateUserData } from '@opendatacapture/schemas/user';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

import { USERS_QUERY_KEY } from './useUsersQuery';

export function useCreateUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ data, language }: { data: CreateUserData; language?: Language }) => {
      // The welcome-email language is a query param so it stays out of the user record itself.
      // The timeout must outlast the server's whole SMTP failure budget: aborting sooner leaves
      // the user already created, so a retry hits "username exists" and the admin never learns
      // whether the welcome email went out.
      const response = await axios.post('/v1/users', data, {
        meta: { disableDefaultErrorNotification: true, disableDefaultTimeout: true },
        params: { language },
        timeout: MAIL_CLIENT_TIMEOUT
      });
      return $CreateUserResponse.parseAsync(response.data);
    },
    onSuccess() {
      void queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
    },
    // `create.tsx` catches the rejection to map password error codes onto field messages, so it
    // must not also escape to the router error boundary.
    throwOnError: false
  });
}
