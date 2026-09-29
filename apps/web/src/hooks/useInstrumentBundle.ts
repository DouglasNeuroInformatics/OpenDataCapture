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
    queryKey: ['instrument-bundle', currentGroupId, id],
    // The bundle behind an id never changes, so the refetch React Query would otherwise run whenever
    // the clinician returns to the tab only re-downloads a payload that can be many megabytes — and,
    // because queries throw on error, a failed one would replace the open instrument (and the data
    // entered into it) with the error boundary. Deleting a series drops its cached bundle instead,
    // in useDeleteSeriesInstrumentMutation.
    staleTime: Infinity
  });
}
