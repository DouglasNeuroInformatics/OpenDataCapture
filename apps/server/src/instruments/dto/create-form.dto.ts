import {
  FormDetails,
  FormInstrument,
  FormInstrumentContent,
  FormInstrumentData,
  formInstrumentSchema
} from '@ddcp/common';
import { JSONSchemaType } from 'ajv';

import { ValidationSchema } from '@/core/decorators/validation-schema.decorator';

@ValidationSchema<FormInstrument>(formInstrumentSchema)
export class CreateFormDto implements FormInstrument {
  kind: 'form';
  name: string;
  tags: string[];
  version: number;
  details: FormDetails;
  content: FormInstrumentContent<FormInstrumentData>;
  validationSchema: JSONSchemaType<FormInstrumentData>;
}
