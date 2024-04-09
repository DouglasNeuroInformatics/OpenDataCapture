import { useNotificationsStore } from '@douglasneuroinformatics/libui/hooks';
import type { CreateAssignmentData } from '@opendatacapture/schemas/assignment';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

export function useCreateAssignment() {
  const queryClient = useQueryClient();
  const { addNotification } = useNotificationsStore();
  return useMutation({
    mutationFn: ({ data }: { data: CreateAssignmentData }) => axios.post('/v1/assignments', data),
    onSuccess() {
      addNotification({ type: 'success' });
      void queryClient.invalidateQueries({ queryKey: ['assignments'] });
    }
  });
}
