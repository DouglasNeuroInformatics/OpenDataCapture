import { useMemo } from 'react';

import { type SelectOption, getFormFields } from '@douglasneuroinformatics/ui';
import type { AnyUnilingualFormInstrument } from '@open-data-capture/common/instrument';
import { match } from 'ts-pattern';

export function useMeasureOptions(instrument: AnyUnilingualFormInstrument | null): SelectOption[] {
  return useMemo(() => {
    const arr: SelectOption[] = [];
    if (instrument) {
      const formFields = getFormFields(instrument.content);
      for (const key in instrument.measures) {
        const label = match(instrument.measures[key])
          .with({ kind: 'computed' }, (measure) => measure.label)
          .with({ kind: 'const' }, (measure) => {
            if (measure.label) {
              return measure.label;
            }
            const field = formFields[key];
            if (field.kind === 'dynamic') {
              return field.render(null)?.label;
            }
            return field.label;
          })
          .exhaustive();
        if (!label) {
          continue;
        }
        arr.push({ key, label });
      }
    }
    return arr;
  }, [instrument]);
}
