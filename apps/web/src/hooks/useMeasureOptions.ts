import { useMemo } from 'react';

import type { ListboxDropdownOption } from '@douglasneuroinformatics/libui/components';
import { getFormFields } from '@opendatacapture/instrument-utils';
import type { AnyUnilingualScalarInstrument, FormInstrument } from '@opendatacapture/runtime-core';
import { match } from 'ts-pattern';

/**
 * The measures of any scalar instrument, as dropdown options.
 *
 * A `const` measure may omit its own label and borrow the label of the form field it references,
 * which is only possible for a form — every other kind has no fields to borrow from, so its
 * measures fall back to the reference and then to the key.
 */
export function useMeasureOptions(instrument: AnyUnilingualScalarInstrument | null): ListboxDropdownOption[] {
  return useMemo(() => {
    const arr: ListboxDropdownOption[] = [];
    if (instrument) {
      // The type argument is explicit because `content` is typed `any` on the scalar union, which
      // leaves `TData` to collapse and `Fields` to resolve against the wrong shape.
      const formFields = instrument.kind === 'FORM' ? getFormFields<FormInstrument.Data>(instrument.content) : null;
      for (const key in instrument.measures) {
        const label = match(instrument.measures[key]!)
          .with({ kind: 'computed' }, (measure) => measure.label)
          .with({ kind: 'const' }, (measure) => {
            if (measure.label) {
              return measure.label;
            }
            // Only a form has fields to borrow a label from; everything else falls back to the
            // measure's own key, which is also what the record table's column header shows.
            if (!formFields) {
              return key;
            }
            const field = formFields[key]!;
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
