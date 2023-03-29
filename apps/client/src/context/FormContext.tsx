import { createContext } from 'react';

import { FormFieldType } from '@ddcp/common';

export const FormContext = createContext<{
  errors: {
    [field: string]: string;
  };
  values: {
    [field: string]: FormFieldType;
  };
  setValue: (key: string, value: FormFieldType) => void;
}>(null!);
