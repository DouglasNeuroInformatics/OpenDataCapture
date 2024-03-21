import {
  $InstrumentMeasureValue,
  type AnyUnilingualInstrument,
  type InstrumentMeasureValue
} from '@open-data-capture/common/instrument';
import _ from 'lodash';
import { match } from 'ts-pattern';

import { extractFieldLabel } from './form.js';
import { isFormInstrument } from './guards.js';

export type ComputedMeasures = { [key: string]: { label: string; value: InstrumentMeasureValue } };

export function computeInstrumentMeasures(instrument: AnyUnilingualInstrument, data: unknown) {
  const computedMeasures: ComputedMeasures = {};
  for (const key in instrument.measures) {
    const result = match(instrument.measures[key])
      .with({ kind: 'computed' }, (measure) => {
        return { label: measure.label, value: measure.value(data) };
      })
      .with({ kind: 'const' }, (measure) => {
        if (!_.isPlainObject(data)) {
          console.error(`Cannot extract key '${key}' from data: ${data} is not an object`);
          return null;
        }
        const result = $InstrumentMeasureValue.safeParse(Reflect.get(data as object, key));
        if (!result.success) {
          console.error('Failed to Parse Constant Measure', result.error);
          return null;
        }

        let label: string | undefined;
        if (measure.label) {
          label = measure.label;
        } else if (isFormInstrument(instrument)) {
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
