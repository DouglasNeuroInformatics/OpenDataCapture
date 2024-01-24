import { useMemo } from 'react';

import type { SelectOption } from '@douglasneuroinformatics/ui';
import type { AnyUnilingualFormInstrument } from '@open-data-capture/common/instrument';

export function useMeasureOptions(instrument: AnyUnilingualFormInstrument | null): SelectOption[] {
  return useMemo(() => {
    const arr: SelectOption[] = [];
    if (instrument) {
      for (const measure in instrument.measures) {
        arr.push({
          key: measure,
          label: instrument.measures[measure].label
        });
      }
    }
    return arr;
  }, [instrument]);
}
