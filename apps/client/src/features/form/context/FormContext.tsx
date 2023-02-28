import { createContext } from 'react';

import { FieldValue, FormValues } from '../types';

export const FormContext = createContext<{
  values: FormValues;
  onChange: (key: PropertyKey, value: FieldValue) => void;
}>(null!);
