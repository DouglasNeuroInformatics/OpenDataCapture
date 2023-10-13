import type { FormInstrumentContent, FormDataType } from '@douglasneuroinformatics/form-types';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { FormDetails, FormInstrument, Measures } from '@open-data-capture/types';
import { type JSONSchemaType } from 'ajv';
import { Schema as MongooseSchema } from 'mongoose';

import { BaseInstrumentEntity } from './base-instrument.entity';
import { FormDetailsSchema } from './form-details.entity';

@Schema()
export class FormInstrumentEntity<TData extends FormDataType = FormDataType>
  extends BaseInstrumentEntity
  implements FormInstrument<TData>
{
  @Prop({ required: true, type: MongooseSchema.Types.Mixed })
  content: FormInstrumentContent<TData>;
  // name: string;
  // tags: string[];
  // version: number;

  @Prop({ required: true, type: FormDetailsSchema })
  details: FormDetails;

  kind: 'form';

  @Prop({ required: false, type: Object })
  measures?: Measures<TData>;

  @Prop({ required: true, type: Object })
  validationSchema: JSONSchemaType<TData>;
}

export const FormInstrumentSchema = SchemaFactory.createForClass(FormInstrumentEntity);
