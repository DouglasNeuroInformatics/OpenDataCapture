import { useMemo } from 'react';

import type { SelectOption } from '@douglasneuroinformatics/ui';
import type { UnilingualInstrumentSummary } from '@open-data-capture/common/instrument';

export function useMeasureOptions(instrumentSummary: UnilingualInstrumentSummary | null): SelectOption[] {
  return useMemo(() => {
    const arr: SelectOption[] = [];
    if (instrumentSummary) {
      for (const measure in instrumentSummary.measures) {
        arr.push({
          key: measure,
          label: instrumentSummary.measures[measure].label
        });
      }
    }
    return arr;
  }, [instrumentSummary]);
}
