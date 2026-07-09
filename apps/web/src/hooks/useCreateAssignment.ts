import { useNotificationsStore } from '@douglasneuroinformatics/libui/hooks';
import { $Assignment } from '@opendatacapture/schemas/assignment';
import type { CreateAssignmentData } from '@opendatacapture/schemas/assignment';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

export function useCreateAssignment() {
  const queryClient = useQueryClient();
  const addNotification = useNotificationsStore((store) => store.addNotification);
  return useMutation({
    mutationFn: async ({ data }: { data: CreateAssignmentData }) => {
      const response = await axios.post('/v1/assignments', data);
      return $Assignment.parse(response.data);
    },
    onSuccess() {
      addNotification({ type: 'success' });
      void queryClient.invalidateQueries({ queryKey: ['assignments'] });
    }
  });
}
