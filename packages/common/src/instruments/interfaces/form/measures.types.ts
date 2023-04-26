import { Simplify } from 'type-fest';

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

type ComputedMeasure<TData extends FormInstrumentData> = Simplify<
  Measure<TData> & {
    value: number;
  }
>;

export type Measures<TData extends FormInstrumentData> = {
  [key: string]: Measure<TData>;
};

export type ComputedMeasures<TData extends FormInstrumentData> = {
  [key: string]: ComputedMeasure<TData>;
};
