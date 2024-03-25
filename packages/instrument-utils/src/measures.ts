import { isPlainObject } from '@douglasneuroinformatics/libjs';
import {
  $InstrumentMeasureValue,
  type AnyUnilingualInstrument,
  type InstrumentMeasureValue
} from '@open-data-capture/schemas/instrument';
import { match } from 'ts-pattern';

import { extractFieldLabel } from './form.js';
import { isFormInstrument } from './guards.js';

export type ComputedMeasures = { [key: string]: { label: string; value: InstrumentMeasureValue } };

export function computeInstrumentMeasures(instrument: AnyUnilingualInstrument, data: unknown) {
  const computedMeasures: ComputedMeasures = {};
  if (!isPlainObject(data)) {
    console.error(`Cannot compute measures from data: ${JSON.stringify(data)} is not an object`);
    return computedMeasures;
  }
  for (const key in instrument.measures) {
    const result = match(instrument.measures[key])
      .with({ kind: 'computed' }, (measure) => {
        // @ts-expect-error - this is ignored because it is safer than the previous (any) solution
        return { label: measure.label, value: measure.value(data) };
      })
      .with({ kind: 'const' }, (measure) => {
        const result = $InstrumentMeasureValue.safeParse(data[key]);
        if (!result.success) {
          console.error('Failed to Parse Constant Measure', result.error);
          return null;
        }

        let label: string | undefined;
        if (measure.label) {
          label = measure.label;
        } else if (isFormInstrument(instrument)) {
          // @ts-expect-error - this is ignored because it is safer than the previous (any) solution
          label = extractFieldLabel(instrument, key, data);
        }
        if (!label) {
          console.error(`Failed to extract label for key '${key}' from data '${JSON.stringify(data)}'`);
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
