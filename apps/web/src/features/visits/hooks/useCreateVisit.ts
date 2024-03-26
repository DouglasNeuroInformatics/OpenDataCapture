import { useNotificationsStore } from '@douglasneuroinformatics/ui/hooks';
import { $Visit, type CreateVisitData } from '@opendatacapture/common/visit';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

export function useCreateVisit() {
  const { addNotification } = useNotificationsStore();
  return useMutation({
    mutationFn: async (data: CreateVisitData) => {
      const response = await axios.post('/v1/visits', data);
      return $Visit.parseAsync(response.data);
    },
    onSuccess() {
      addNotification({ type: 'success' });
    }
  });
}
