import { useNotificationsStore } from '@douglasneuroinformatics/libui/hooks';
import type { UpdateSetupStateData } from '@opendatacapture/schemas/setup';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

import { SETUP_STATE_QUERY_KEY } from './useSetupStateQuery';

export function useUpdateSetupStateMutation() {
  const queryClient = useQueryClient();
  const addNotification = useNotificationsStore((store) => store.addNotification);
  return useMutation({
    mutationFn: async (data: UpdateSetupStateData) => {
      await axios.patch('/v1/setup', data);
    },
    onSuccess() {
      addNotification({ type: 'success' });
      void queryClient.invalidateQueries({ queryKey: [SETUP_STATE_QUERY_KEY] });
    }
  });
}
