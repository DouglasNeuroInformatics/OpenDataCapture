import { FormFields, FormInstrumentContent, FormInstrumentData } from '@douglasneuroinformatics/common';
import { ErrorObject } from 'ajv';

import { FormErrors, FormValues, NullableArrayFieldValue, NullablePrimitiveFieldValue } from './types';

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
        defaultItemValues[subfieldName] = null;
      }
      defaultValues[fieldName] = [defaultItemValues];
    } else {
      defaultValues[fieldName] = null;
    }
  }
  return defaultValues as FormValues<T>;
};

export function getFormErrors<T extends FormInstrumentData>(validationErrors?: ErrorObject[] | null): FormErrors<T> {
  const formErrors: FormErrors<T> = {};
  if (!validationErrors) {
    return formErrors;
  }
  for (const error of validationErrors) {
    const errorMessage = `${error.message ?? 'Unknown Error'}`;
    const path = error.instancePath.split('/').filter((e) => e);
    const baseField = path[0] as Extract<keyof T, string>;
    if (path.length === 1) {
      formErrors[baseField] = errorMessage;
    } else if (path.length === 3) {
      if (!Array.isArray(formErrors[baseField])) {
        formErrors[baseField] = [];
      }
      const arrayErrors = formErrors[baseField] as Record<string, string>[];
      if (!arrayErrors[parseInt(path[1])]) {
        arrayErrors[parseInt(path[1])] = {};
      }
      arrayErrors[parseInt(path[1])][path[2]] = errorMessage;
    }
  }
  return formErrors;
}
