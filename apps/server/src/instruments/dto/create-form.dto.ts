import {
  FormDetails,
  FormField,
  FormInstrument,
  FormInstrumentData,
  InstrumentKind,
  formInstrumentSchema
} from '@ddcp/common';
import { JSONSchemaType } from 'ajv';

import { ValidationSchema } from '@/core/decorators/validation-schema.decorator';

@ValidationSchema<FormInstrument>(formInstrumentSchema)
export class CreateFormDto {
  kind: InstrumentKind.Form;
  name: string;
  tags: string[];
  version: number;
  details: FormDetails;
  content: {
    [key: string]: FormField;
  };
  validationSchema: JSONSchemaType<FormInstrumentData>;
}
