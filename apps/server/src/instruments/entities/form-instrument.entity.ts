import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import {
  type FormDetails,
  FormInstrument,
  type FormInstrumentContent,
  FormInstrumentData,
  type Measures
} from '@douglasneuroinformatics/common';
import { type JSONSchemaType } from 'ajv';
import { Schema as MongooseSchema } from 'mongoose';

import { BaseInstrumentEntity } from './base-instrument.entity';
import { FormDetailsSchema } from './form-details.entity';

@Schema()
export class FormInstrumentEntity<TData extends FormInstrumentData = FormInstrumentData>
  extends BaseInstrumentEntity
  implements FormInstrument<TData>
{
  kind: 'form';
  name: string;
  tags: string[];
  version: number;

  @Prop({ required: true, type: FormDetailsSchema })
  details: FormDetails;

  @Prop({ required: true, type: MongooseSchema.Types.Mixed })
  content: FormInstrumentContent<TData>;

  @Prop({ required: true, type: Object })
  validationSchema: JSONSchemaType<FormInstrumentData>;

  @Prop({ required: false, type: Object })
  measures?: Measures<FormInstrumentData>;
}

export const FormInstrumentSchema = SchemaFactory.createForClass(FormInstrumentEntity);
