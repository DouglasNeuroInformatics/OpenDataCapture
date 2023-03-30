import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import {
  type FormDetails,
  FormField,
  FormInstrument,
  type FormInstrumentContent,
  FormInstrumentData
} from '@ddcp/common';
import { type JSONSchemaType } from 'ajv';
import { Schema as MongooseSchema } from 'mongoose';

import { FormDetailsSchema } from './form-details-entity';

@Schema()
export class FormInstrumentEntity implements FormInstrument {
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
