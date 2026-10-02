import { useNotificationsStore } from '@douglasneuroinformatics/libui/hooks';
import { $DeleteBulkAssignmentsResult } from '@opendatacapture/schemas/assignment';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

import { ASSIGNMENTS_QUERY_KEY_PREFIX } from '@/hooks/useAssignmentsQuery';

export function useDeleteBulkAssignmentsMutation() {
  const queryClient = useQueryClient();
  const addNotification = useNotificationsStore((store) => store.addNotification);
  return useMutation({
    mutationFn: async ({ ids }: { ids: string[] }) => {
      const response = await axios.post('/v1/assignments/bulk/delete', { ids });
      return $DeleteBulkAssignmentsResult.parse(response.data);
    },
    onSuccess(result) {
      addNotification({ type: 'success' });
      void queryClient.invalidateQueries({ queryKey: [ASSIGNMENTS_QUERY_KEY_PREFIX] });
      return result;
    }
  });
}
