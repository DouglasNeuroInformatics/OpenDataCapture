import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { type FormDetails, FormField, FormInstrument, FormInstrumentData, InstrumentKind } from '@ddcp/common';
import { type JSONSchemaType } from 'ajv';
import { Schema as MongooseSchema } from 'mongoose';

import { FormDetailsSchema } from './form-details-entity';
import { FormFieldSchema } from './form-field.entity';

@Schema({ strict: 'throw' })
export class FormInstrumentEntity implements FormInstrument {
  kind: InstrumentKind.Form;
  name: string;
  tags: string[];
  version: number;

  @Prop({ required: true, type: FormDetailsSchema })
  details: FormDetails;

  @Prop({ required: true, type: MongooseSchema.Types.Map, of: FormFieldSchema })
  content: {
    [key: string]: FormField;
  };

  @Prop({ required: true, type: Object })
  validationSchema: JSONSchemaType<FormInstrumentData>;
}

export const FormInstrumentSchema = SchemaFactory.createForClass(FormInstrumentEntity);
