import { $SetupState } from '@opendatacapture/schemas/setup';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export function useSetupState() {
  return useQuery({
    queryFn: async () => {
      const response = await axios.get('/v1/setup');
      return $SetupState.parseAsync(response.data);
    },
    queryKey: ['setup-state']
  });
}
