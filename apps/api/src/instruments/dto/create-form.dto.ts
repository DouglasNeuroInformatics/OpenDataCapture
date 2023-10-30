import type { FormDataType } from '@douglasneuroinformatics/form-types';
import { ValidationSchema } from '@douglasneuroinformatics/nestjs/core';
import type { Language } from '@open-data-capture/common/core';
import type * as Types from '@open-data-capture/common/instrument';
import { formInstrumentSchema } from '@open-data-capture/common/instrument';
import type Z from 'zod';

@ValidationSchema(formInstrumentSchema)
export class CreateFormDto implements Types.FormInstrument {
  content: Types.FormInstrumentContent;
  details: Types.InstrumentDetails;
  kind: 'form';
  language: Types.InstrumentLanguage;
  measures?: Types.FormInstrumentMeasures;
  name: string;
  tags: Record<Language, string[]> | string[];
  validationSchema: Z.ZodType<FormDataType>;
  version: number;
}
