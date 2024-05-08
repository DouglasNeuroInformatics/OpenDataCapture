import { useNotificationsStore } from '@douglasneuroinformatics/libui/hooks';
import { $Group, type UpdateGroupData } from '@opendatacapture/schemas/group';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

import { useAppStore } from '@/store';

export function useUpdateGroup() {
  const addNotification = useNotificationsStore((store) => store.addNotification);
  const currentGroup = useAppStore((store) => store.currentGroup);
  return useMutation({
    mutationFn: async (data: UpdateGroupData) => {
      const response = await axios.patch(`/v1/groups/${currentGroup?.id}`, data);
      return $Group.parseAsync(response.data);
    },
    onSuccess() {
      addNotification({ type: 'success' });
    }
  });
}
