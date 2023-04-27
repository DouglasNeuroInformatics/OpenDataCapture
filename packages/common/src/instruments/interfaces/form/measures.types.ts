import { FormInstrumentData } from './form-fields.types';

export type Measure<TData extends FormInstrumentData = FormInstrumentData> = {
  label: string;
  formula:
    | {
        kind: 'sum';
        fields: Array<keyof TData>;
      }
    | {
        kind: 'const';
        field: keyof TData;
      };
};

export type Measures<TData extends FormInstrumentData = FormInstrumentData> = {
  [key: string]: Measure<TData>;
};
