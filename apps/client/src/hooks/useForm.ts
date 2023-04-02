import { useState } from 'react';

import {
  FormField,
  FormFieldKind,
  FormFieldValue,
  FormFields,
  FormInstrumentContent,
  FormInstrumentData
} from '@ddcp/common';

import { FormErrors, FormValues } from '@/components/Form_2';

const defaultPrimitiveValues: Record<Exclude<FormFieldKind, 'complex'>, FormFieldValue | null> = {
  text: '',
  options: '',
  date: '',
  numeric: NaN,
  binary: null
};

const getDefaultValuesFromFields = <T extends FormInstrumentData>(formFields: FormFields<T>): FormValues<T> => {
  const values: Partial<FormValues> = {};
  for (const fieldName in formFields) {
    const field = formFields[fieldName];
    if (field.kind === 'complex') {
      throw new Error('Not Implemented!');
    } else {
      values[fieldName] = defaultPrimitiveValues[field.kind];
    }
  }
  return values as FormValues<T>;
};

export interface FormState<T extends FormInstrumentData> {
  errors: FormErrors<T>;
  setErrors: React.Dispatch<React.SetStateAction<FormErrors<T>>>;
  values: FormValues<T>;
  setValues: React.Dispatch<React.SetStateAction<FormValues<T>>>;
}

export function useForm<T extends FormInstrumentData>(content: FormInstrumentContent<T>) {
  const [errors, setErrors] = useState<FormErrors<T>>({});
  const [values, setValues] = useState<FormValues<T>>(() => {
    return Array.isArray(content) ? {} : getDefaultValuesFromFields(content);
  });

  return { errors, setErrors, values, setValues };
}
