import type { Language } from '@opendatacapture/schemas/core';
import { $EmailDeliveryResult } from '@opendatacapture/schemas/mail';
import { $User } from '@opendatacapture/schemas/user';
import type { CreateUserData } from '@opendatacapture/schemas/user';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { z } from 'zod/v4';

import { USERS_QUERY_KEY } from './useUsersQuery';

/** The created user, augmented with the outcome of the welcome-email attempt. */
const $CreateUserResponse = $User.extend({ welcomeEmail: $EmailDeliveryResult.optional() });

export type CreateUserResponse = z.infer<typeof $CreateUserResponse>;

export function useCreateUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ data, language }: { data: CreateUserData; language?: Language }) => {
      // The welcome-email language is a query param so it stays out of the user record itself.
      // A slow SMTP host can take ~20s server-side; without opting out of the global 10s timeout
      // the request aborts *after* the user is created, so a retry hits "username exists" and the
      // admin never learns whether the welcome email went out.
      const response = await axios.post('/v1/users', data, {
        meta: { disableDefaultErrorNotification: true, disableDefaultTimeout: true },
        params: { language },
        timeout: 30_000
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
