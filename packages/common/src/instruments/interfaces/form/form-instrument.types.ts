import { JSONSchemaType } from 'ajv';
import { Simplify } from 'type-fest';

import { BaseInstrument } from '../base/base-instrument.interface';

import { FormDetails } from './form-details.types';
import { FormFields, FormFieldsGroup, FormInstrumentData } from './form-fields.types';

export type FormInstrumentContent<T extends FormInstrumentData = FormInstrumentData> =
  | FormFields<T>
  | FormFieldsGroup<T>[];

export type FormInstrument<T extends FormInstrumentData = FormInstrumentData> = Simplify<
  BaseInstrument<FormInstrumentContent<T>> & {
    details: FormDetails;
    validationSchema: JSONSchemaType<T>;
  }
>;
