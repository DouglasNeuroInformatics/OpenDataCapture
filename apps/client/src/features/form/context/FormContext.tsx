import { createContext } from 'react';

import { FormValues } from '../types';

export interface FormContextInterface {
  values: FormValues;
  setValues: React.Dispatch<React.SetStateAction<FormValues>>;
}

export const FormContext = createContext<FormContextInterface>(null!);
