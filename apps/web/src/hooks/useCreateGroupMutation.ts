import { useNotificationsStore } from '@douglasneuroinformatics/libui/hooks';
import type { $CreateGroupData } from '@opendatacapture/schemas/group';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

import { GROUPS_QUERY_KEY } from './useGroupsQuery';

export function useCreateGroupMutation() {
  const queryClient = useQueryClient();
  const addNotification = useNotificationsStore((store) => store.addNotification);
  return useMutation({
    mutationFn: ({ data }: { data: $CreateGroupData }) => {
      return axios.post('/v1/groups', data, { meta: { disableDefaultErrorNotification: true } });
    },
    onSuccess() {
      addNotification({ type: 'success' });
      void queryClient.invalidateQueries({ queryKey: [GROUPS_QUERY_KEY] });
    },
    // `create.tsx` catches the rejection to report it on the form, which keeps what the admin typed,
    // so it must not also escape to the router error boundary.
    throwOnError: false
  });
}
