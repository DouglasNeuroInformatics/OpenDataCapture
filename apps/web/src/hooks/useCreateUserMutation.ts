import { useNotificationsStore } from '@douglasneuroinformatics/libui/hooks';
import type { EmailDeliveryResult, MailLanguage } from '@opendatacapture/schemas/mail';
import type { CreateUserData, User } from '@opendatacapture/schemas/user';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

import { USERS_QUERY_KEY } from './useUsersQuery';

/** The created user, augmented with the outcome of the welcome-email attempt. */
export type CreateUserResponse = User & { welcomeEmail?: EmailDeliveryResult };

export function useCreateUserMutation() {
  const queryClient = useQueryClient();
  const addNotification = useNotificationsStore((store) => store.addNotification);
  return useMutation({
    mutationFn: async ({ data, language }: { data: CreateUserData; language?: MailLanguage }) => {
      // The welcome-email language is a query param so it stays out of the user record itself.
      const response = await axios.post<CreateUserResponse>('/v1/users', data, {
        meta: { disableDefaultErrorNotification: true },
        params: { language }
      });
      return response.data;
    },
    onSuccess() {
      addNotification({ type: 'success' });
      void queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
    }
  });
}
