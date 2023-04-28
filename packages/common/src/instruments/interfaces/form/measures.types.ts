import { ConditionalKeys } from 'type-fest';

import { FormInstrumentData } from './form-fields.types';

export type Measure<TData extends FormInstrumentData = FormInstrumentData> = {
  label: string;
  formula:
    | {
        kind: 'sum';
        fields: Array<ConditionalKeys<TData, number | boolean>>;
        options?: {
          coerceBool?: boolean;
        };
      }
    | {
        kind: 'const';
        field: ConditionalKeys<TData, number>;
      };
};

export type Measures<TData extends FormInstrumentData = FormInstrumentData> = {
  [key: string]: Measure<TData>;
};
