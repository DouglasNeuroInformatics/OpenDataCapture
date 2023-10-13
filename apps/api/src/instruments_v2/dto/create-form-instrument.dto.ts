import type { FormDataType } from '@douglasneuroinformatics/form-types';
import type Types from '@open-data-capture/types';
import type { JSONSchemaType } from 'ajv';

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
