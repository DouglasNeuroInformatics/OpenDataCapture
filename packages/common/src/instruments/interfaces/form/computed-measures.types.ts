import { Language } from '../../../core';

import { FormInstrumentData } from './form-fields.types';

type ComputedMeasure<TData extends FormInstrumentData> = {
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

export type ComputedMeasures<TData extends FormInstrumentData> = {
  [key: string]: ComputedMeasure<TData>;
};
