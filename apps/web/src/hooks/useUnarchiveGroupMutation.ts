import { useNotificationsStore } from '@douglasneuroinformatics/libui/hooks';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

import { GROUPS_QUERY_KEY } from './useGroupsQuery';

export function useUnarchiveGroupMutation() {
  const queryClient = useQueryClient();
  const addNotification = useNotificationsStore((store) => store.addNotification);
  return useMutation({
    mutationFn: ({ id }: { id: string }) => axios.patch(`/v1/groups/${id}/unarchive`),
    onSuccess() {
      addNotification({ type: 'success' });
      void queryClient.invalidateQueries({ queryKey: [GROUPS_QUERY_KEY] });
    }
  });
}
