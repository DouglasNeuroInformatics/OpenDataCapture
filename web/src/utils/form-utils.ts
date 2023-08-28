import { FormInstrument } from '@ddcp/types';
import {
  ArrayFieldValue,
  FormFields,
  FormInstrumentData,
  PrimitiveFieldValue
} from '@douglasneuroinformatics/form-types';

/** Return the `FormFields` for an instrument */
export function extractFields<T extends FormInstrumentData>(instrument: FormInstrument<T>) {
  if (Array.isArray(instrument.content)) {
    return instrument.content.reduce((accumulator, current) => {
      return Object.assign(accumulator, current.fields);
    }, {}) as FormFields<T>;
  }
  return instrument.content;
}

export function camelToSnakeCase(s: string) {
  return s.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

export function formatDataAsString<T extends FormInstrumentData>(data: T) {
  const lines: string[] = [];
  for (const key in data) {
    const value: PrimitiveFieldValue | ArrayFieldValue = data[key]!;
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
