import type { FormDataType } from '@douglasneuroinformatics/form-types';
import type Types from '@open-data-capture/types';
import type { JSONSchemaType } from 'ajv';

import { ValidationSchema } from '@/core/decorators/validation-schema.decorator';

import { formInstrumentSchema } from '../schemas/form-instrument.schema';

@ValidationSchema(formInstrumentSchema)
export class CreateFormInstrumentDto implements Types.FormInstrument {
  content: Types.FormInstrumentContent;
  details: Types.FormInstrumentDetails;
  kind: 'form';
  language: Types.InstrumentLanguage;
  measures?: Types.FormInstrumentMeasures;
  name: string;
  tags: Record<Types.Language, string[]> | string[];
  validationSchema: JSONSchemaType<FormDataType>;
  version: number;
}
