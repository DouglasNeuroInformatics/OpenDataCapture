import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { type FormDetails, type FormInstrumentContent, FormInstrumentData } from '@douglasneuroinformatics/common';
import { type JSONSchemaType } from 'ajv';
import { Schema as MongooseSchema } from 'mongoose';

import { BaseInstrumentEntity } from './base-instrument.entity';
import { FormDetailsSchema } from './form-details.entity';

@Schema()
export class FormInstrumentEntity extends BaseInstrumentEntity {
  kind: 'form';
  name: string;
  tags: string[];
  version: number;

  @Prop({ required: true, type: FormDetailsSchema })
  details: FormDetails;

  @Prop({ required: true, type: MongooseSchema.Types.Mixed })
  content: FormInstrumentContent;

  @Prop({ required: true, type: Object })
  validationSchema: JSONSchemaType<FormInstrumentData>;
}

export const FormInstrumentSchema = SchemaFactory.createForClass(FormInstrumentEntity);
