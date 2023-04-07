import { FormFields, FormInstrumentContent, FormInstrumentData } from '@ddcp/common';

import { FormValues, NullableArrayFieldValue, NullablePrimitiveFieldValue } from './types';

export const DEFAULT_PRIMITIVE_VALUES = {
  text: '',
  options: '',
  date: '',
  numeric: null,
  binary: null
};

/** Extract a flat array of form fields from the content. This function assumes there are no duplicate keys in groups  */
export function getFormFields<T extends FormInstrumentData>(content: FormInstrumentContent<T>): FormFields<T> {
  let fields: FormFields<T>;
  if (Array.isArray(content)) {
    fields = content.reduce((prev, current) => ({ ...prev, ...current.fields }), content[0].fields) as FormFields<T>;
  } else {
    fields = content;
  }
  return fields;
}

/** Returns the default values when initializing the state or resetting the form */
export const getDefaultValues = <T extends FormInstrumentData>(content: FormInstrumentContent<T>): FormValues<T> => {
  const defaultValues: Record<string, NullableArrayFieldValue | NullablePrimitiveFieldValue> = {};

  // Get a flat array of all fields regardless of the content type
  const fields = getFormFields(content);

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
