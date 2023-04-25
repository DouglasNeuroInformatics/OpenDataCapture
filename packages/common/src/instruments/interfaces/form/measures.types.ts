import { FormInstrumentData } from './form-fields.types';

import { Language } from '@/core';

type Measure<TData extends FormInstrumentData> = {
  label: {
    [L in Language]: string;
  };
  formula:
    | {
        $sum: Array<keyof TData>;
      }
    | {
        $const: keyof TData;
      };
};

export type Measures<TData extends FormInstrumentData> = {
  [key: string]: Measure<TData>;
};
