import { useNotificationsStore } from '@douglasneuroinformatics/libui/hooks';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

import { useAppStore } from '@/store';

import { GROUPS_QUERY_KEY } from './useGroupsQuery';

export function useArchiveGroupMutation() {
  const queryClient = useQueryClient();
  const addNotification = useNotificationsStore((store) => store.addNotification);
  const changeGroup = useAppStore((store) => store.changeGroup);
  const currentGroup = useAppStore((store) => store.currentGroup);
  return useMutation({
    mutationFn: ({ id }: { id: string }) => axios.patch(`/v1/groups/${id}/archive`),
    onSuccess(_, { id }) {
      addNotification({ type: 'success' });
      // The switcher stops listing an archived group, so leaving it selected would strand the switcher on it.
      if (currentGroup?.id === id) {
        changeGroup(null);
      }
      void queryClient.invalidateQueries({ queryKey: [GROUPS_QUERY_KEY] });
    }
  });
}
