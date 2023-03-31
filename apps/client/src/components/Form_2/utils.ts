
import {
  FormField,
  FormFieldKind,
  FormFieldValue,
  FormFields,
  FormInstrumentContent,
  FormInstrumentData,
  PrimitiveFormField
} from '@ddcp/common';

type PrimitiveFieldKind = Exclude<FormFieldKind, 'complex'>;

const defaultValues: Record<Exclude<FormFieldKind, 'complex'>, FormFieldValue | undefined> = {
  text: '',
  options: '',
  date: '',
  numeric: NaN,
  binary: undefined
};

function fromPrimitiveFields<T extends Record<string, FormFieldValue>>(formFields: {
  [K in keyof T]: PrimitiveFormField<T[K]>;
}): T {
  const values: Partial<T> = {};
  for (const fieldName in formFields) {
    const field = formFields[fieldName];
    values[fieldName] = defaultValues[field.kind];
  }
  return values as T;
}

/** Extract default values for type T from instrument content */
export function getDefaultFormValues<T extends FormInstrumentData>(formContent: FormInstrumentContent<T>): T {
  const values: Partial<T> = {};
  if (Array.isArray(formContent)) {
    throw new Error();
  } else {
    for (const fieldName of Object.keys(formContent)) {
      switch (formContent[fieldName].kind) {
        case 'binary' | '':
      }
    }
    formContent;
  }
  return values;
}
