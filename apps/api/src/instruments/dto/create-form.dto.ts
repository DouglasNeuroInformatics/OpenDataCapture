import type { JSONSchemaType } from '@douglasneuroinformatics/ajv';
import type { FormDataType } from '@douglasneuroinformatics/form-types';
import { ValidationSchema } from '@douglasneuroinformatics/nestjs/core';
import { formInstrumentSchema } from '@open-data-capture/schemas/form-instrument';
import type Types from '@open-data-capture/types';

@ValidationSchema(formInstrumentSchema)
export class CreateFormDto implements Types.FormInstrument {
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
