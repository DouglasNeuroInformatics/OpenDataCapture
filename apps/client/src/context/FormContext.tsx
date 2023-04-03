import React, { createContext } from 'react';

import { FormInstrumentData } from '@ddcp/common';

import type { FormErrors, FormValues } from '@/components';

export interface FormState<T extends FormInstrumentData = FormInstrumentData> {
  errors: FormErrors<T>;
  setErrors: React.Dispatch<React.SetStateAction<FormErrors<T>>>;
  values: FormValues<T>;
  setValues: React.Dispatch<React.SetStateAction<FormValues<T>>>;
}

export const FormContext = createContext<FormState>(null!);

export interface FormProviderProps<T extends FormInstrumentData> extends FormState<T> {
  children: React.ReactNode;
}

export const FormProvider = <T extends FormInstrumentData>({ children, ...props }: FormProviderProps<T>) => {
  return <FormContext.Provider value={props as FormState}>{children}</FormContext.Provider>;
};
