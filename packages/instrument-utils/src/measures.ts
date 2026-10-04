import { isPlainObject } from '@douglasneuroinformatics/libjs';
import type {
  AnyUnilingualScalarInstrument,
  InstrumentMeasures,
  InstrumentMeasureValue,
  Language
} from '@opendatacapture/runtime-core';
import { $InstrumentMeasureValue } from '@opendatacapture/schemas/instrument';
import { match } from 'ts-pattern';

import { extractFieldLabel, isFieldHidden } from './form.js';
import { isFormInstrument } from './guards.js';

export type ComputedMeasures = { [key: string]: { label: string; value: InstrumentMeasureValue } };

export function computeInstrumentMeasures(instrument: AnyUnilingualScalarInstrument, data: unknown) {
  const computedMeasures: ComputedMeasures = {};
  if (!isPlainObject(data)) {
    console.error(`Cannot compute measures from data: ${JSON.stringify(data)} is not an object`);
    return computedMeasures;
  }
  // Widened because `data` is untyped: under an interactive instrument's `Json` data, `ConditionalKeys`
  // makes `ref` a union of `Json[]` members (numbers, array methods), which cannot index `data`.
  const measures: InstrumentMeasures<any, Language> | null = instrument.measures;
  for (const key in measures) {
    const result = match(measures[key]!)
      .with({ kind: 'computed' }, (measure) => {
        return { label: measure.label, value: measure.value(data) };
      })
      .with({ kind: 'const' }, (measure) => {
        if (isFormInstrument(instrument) && isFieldHidden(instrument, measure.ref, data)) {
          return null;
        }
        const result = $InstrumentMeasureValue.safeParse(data[measure.ref]);
        if (!result.success) {
          console.error('Failed to Parse Constant Measure', result.error);
          return null;
        }

        let label: string | undefined;
        if (measure.label) {
          label = measure.label;
        } else if (isFormInstrument(instrument)) {
          // @ts-expect-error - this is ignored because it is safer than the previous (any) solution
          label = extractFieldLabel(instrument, measure.ref, data);
        }
        if (!label) {
          console.error(`Failed to extract label for key '${measure.ref}' from data '${JSON.stringify(data)}'`);
          return;
        }
        return { label, value: result.data };
      })
      .exhaustive();
    if (result) {
      computedMeasures[key] = result;
    }
  }
  return computedMeasures;
}
