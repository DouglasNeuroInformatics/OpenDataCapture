import type FormTypes from '@douglasneuroinformatics/form-types';
import type { FormInstrument } from '@open-data-capture/types';

/** Return the `FormFields` for an instrument */
export function extractFields<T extends FormTypes.FormInstrumentData>(instrument: FormInstrument<T>) {
  if (Array.isArray(instrument.content)) {
    return instrument.content.reduce((accumulator, current) => {
      return Object.assign(accumulator, current.fields);
    }, {}) as FormTypes.FormFields<T>;
  }
  return instrument.content;
}

export function formatDataAsString<T extends FormTypes.FormInstrumentData>(data: T) {
  const lines: string[] = [];
  for (const key in data) {
    const value: FormTypes.PrimitiveFieldValue | FormTypes.ArrayFieldValue = data[key]!;
    if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        const record = value[i]!;
        for (const prop in record) {
          lines.push(`${prop} (${i + 1}): ${record[prop]}`);
        }
      }
    } else {
      lines.push(`${key}: ${value}`);
    }
  }
  return lines.join('\n') + '\n';
}
