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
};

export function useUpdateSetupStateMutation({ successNotification }: UpdateSetupStateMutationOptions = {}) {
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
    }
  });
}
