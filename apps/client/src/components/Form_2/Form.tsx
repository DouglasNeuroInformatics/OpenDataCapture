import React, { useState } from 'react';

import { FormInstrument, FormInstrumentData } from '@ddcp/common';

import { FormErrors, FormValues } from './types';

import { FormContext } from '@/context/FormContext';
import { ajv } from '@/services/ajv';

export interface FormProps<T extends FormInstrumentData>
  extends Pick<FormInstrument<T>, 'content' | 'details' | 'validationSchema'> {
  className?: string;
  onSubmit: (data: T) => void;
}

export const Form = <T extends FormInstrumentData>({ content, details, validationSchema }: FormProps<T>) => {
  const [errors, setErrors] = useState<FormErrors<T>>({});
  const [values, setValues] = useState<T>(() => {
    let defaultValues: FormInstrumentData;
  });

  return (
    <FormContext.Provider>
      <form action="" autoComplete="off"></form>
    </FormContext.Provider>
  );
};
