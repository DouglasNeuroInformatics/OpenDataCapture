import { useNotificationsStore } from '@douglasneuroinformatics/libui/hooks';
import type { UpdateAssignmentData } from '@opendatacapture/schemas/assignment';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

export function useUpdateAssignment() {
  const queryClient = useQueryClient();
  const { addNotification } = useNotificationsStore();
  return useMutation({
    mutationFn: ({ data, params }: { data: UpdateAssignmentData; params: { id: string } }) => {
      return axios.patch(`/v1/assignments/${params.id}`, data);
    },
    onSuccess() {
      addNotification({ type: 'success' });
      void queryClient.invalidateQueries({ queryKey: ['assignments'] });
    }
  });
}
