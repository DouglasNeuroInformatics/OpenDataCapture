import { FormFields, FormInstrumentContent, FormInstrumentData } from '@ddcp/common';

import { FormValues, NullableArrayFieldValue, NullablePrimitiveFieldValue } from './types';

export const DEFAULT_PRIMITIVE_VALUES = {
  text: '',
  options: '',
  date: '',
  numeric: null,
  binary: null
};

/** Returns the default values when initializing the state or resetting the form */
export const getDefaultValues = <T extends FormInstrumentData>(content: FormInstrumentContent<T>): FormValues<T> => {
  const defaultValues: Record<string, NullableArrayFieldValue | NullablePrimitiveFieldValue> = {};
  const fields = (Array.isArray(content) ? content.map((group) => group.fields) : content) as FormFields<T>;
  for (const fieldName in fields) {
    const field = fields[fieldName];
    if (field.kind === 'array') {
      const defaultItemValues: NullableArrayFieldValue[number] = {};
      for (const subfieldName in field.fieldset) {
        const subfield = field.fieldset[subfieldName];
        defaultItemValues[subfieldName] = DEFAULT_PRIMITIVE_VALUES[subfield.kind];
      }
      defaultValues[fieldName] = [defaultItemValues];
    } else {
      defaultValues[fieldName] = DEFAULT_PRIMITIVE_VALUES[field.kind];
    }
  }
  return defaultValues as FormValues<T>;
};
