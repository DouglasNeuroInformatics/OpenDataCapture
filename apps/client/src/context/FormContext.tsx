import { createContext } from 'react';

import { FormFieldValue } from '@ddcp/common';

import { FormErrors, FormValues } from '@/components/Form_2';

export const FormContext = createContext<{
  errors: FormErrors;
  values: FormValues;
  setValue: (key: string, value: FormFieldValue) => void;
}>(null!);
