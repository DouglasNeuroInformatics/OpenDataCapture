import { FormInstrument } from '@ddcp/types';
import { FormFields, FormInstrumentData } from '@douglasneuroinformatics/form-types';

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
