import { FormDetails, FormField, FormInstrument, InstrumentKind, formInstrumentSchema } from '@ddcp/common';
import { JSONSchemaType } from 'ajv';

import { ValidationSchema } from '@/core/decorators/validation-schema.decorator';

@ValidationSchema<FormInstrument>(formInstrumentSchema)
export class CreateFormDto implements FormInstrument {
  kind: InstrumentKind.Form;
  name: string;
  tags: string[];
  version: number;
  details: FormDetails;
  content: FormField[];
  validationSchema: JSONSchemaType<Record<string, any>>;
}
