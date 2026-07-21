import { $InstrumentBundleContainer } from '@opendatacapture/schemas/instrument';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import { useAppStore } from '@/store';

export function useInstrumentBundle(id: null | string) {
  const currentGroupId = useAppStore((store) => store.currentGroup?.id);
  return useQuery({
    enabled: Boolean(id),
    queryFn: async () => {
      const response = await axios.get(`/v1/instruments/bundle/${id}`, {
        params: { groupId: currentGroupId }
      });
      return $InstrumentBundleContainer.parseAsync(response.data);
    },
    queryKey: ['instrument-bundle', currentGroupId, id]
  });
}
