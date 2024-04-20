import { useMemo } from 'react';

import { type LegacySelectOption } from '@douglasneuroinformatics/libui/components';
import { getFormFields } from '@opendatacapture/instrument-utils';
import type { AnyUnilingualFormInstrument } from '@opendatacapture/schemas/instrument';
import { match } from 'ts-pattern';

export function useMeasureOptions(instrument: AnyUnilingualFormInstrument | null): LegacySelectOption[] {
  return useMemo(() => {
    const arr: LegacySelectOption[] = [];
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
              return field.render({})?.label;
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
