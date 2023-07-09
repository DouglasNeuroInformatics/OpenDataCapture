import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import type { FormDetails, FormInstrument, Measures } from '@ddcp/types';
import type { FormInstrumentContent, FormInstrumentData } from '@douglasneuroinformatics/form-types';
import { type JSONSchemaType } from 'ajv';
import { Schema as MongooseSchema } from 'mongoose';

import { BaseInstrumentEntity } from './base-instrument.entity.js';
import { FormDetailsSchema } from './form-details.entity.js';

@Schema()
export class FormInstrumentEntity<TData extends FormInstrumentData = FormInstrumentData>
  extends BaseInstrumentEntity
  implements FormInstrument<TData>
{
  kind: 'form';
  // name: string;
  // tags: string[];
  // version: number;

  @Prop({ required: true, type: FormDetailsSchema })
  details: FormDetails;

  @Prop({ required: true, type: MongooseSchema.Types.Mixed })
  content: FormInstrumentContent<TData>;

  @Prop({ required: true, type: Object })
  validationSchema: JSONSchemaType<TData>;

  @Prop({ required: false, type: Object })
  measures?: Measures<TData>;
}

export const FormInstrumentSchema = SchemaFactory.createForClass(FormInstrumentEntity);
