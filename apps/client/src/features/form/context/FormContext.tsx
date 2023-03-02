import { createContext } from 'react';

import type { FieldValue, FormErrors, FormValues } from '../types';

export const FormContext = createContext<{
  errors: FormErrors;
  values: FormValues;
  setValue: (key: PropertyKey, value: FieldValue) => void;
}>(null!);
