import { JSONSchemaType } from 'ajv';
import { Simplify } from 'type-fest';

import { BaseInstrument } from '../base/base-instrument.interface';

import { FormDetails } from './form-details.types';
import { FormFields, FormFieldsGroup, FormInstrumentData } from './form-fields.types';

export type FormInstrumentContent<TData extends FormInstrumentData = FormInstrumentData> =
  | FormFields<TData>
  | FormFieldsGroup<TData>[];

export type FormInstrument<TData extends FormInstrumentData = FormInstrumentData> = Simplify<
  BaseInstrument & {
    content: FormInstrumentContent<TData>;
    details: FormDetails;
    validationSchema: JSONSchemaType<TData>;
  }
>;
