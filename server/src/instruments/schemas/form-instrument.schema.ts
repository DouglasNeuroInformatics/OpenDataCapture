import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import {
  FormInstrumentFieldInterface,
  FormInstrumentFieldVariant,
  FormInstrumentInterface,
  InstrumentDetailsInterface,
  InstrumentKind,
  formInstrumentFieldVariantOptions
} from 'common';

@Schema({ strict: true })
export class FormInstrumentField implements FormInstrumentFieldInterface {
  @Prop({ required: true, unique: true })
  name: string;
  
  @Prop({ required: true })
  label: string;

  @Prop({ required: false })
  description: string;

  @Prop({ enum: formInstrumentFieldVariantOptions, required: true })
  variant: FormInstrumentFieldVariant;

  @Prop({ required: true })
  isRequired: boolean;
}

export const FormInstrumentFieldSchema = SchemaFactory.createForClass(FormInstrumentField);

@Schema()
export class FormInstrument implements FormInstrumentInterface {
  title: string;
  kind: InstrumentKind;
  details: InstrumentDetailsInterface;

  @Prop({ required: true, type: [FormInstrumentFieldSchema] })
  data: FormInstrumentFieldInterface[];
}

export const FormInstrumentSchema = SchemaFactory.createForClass(FormInstrument);
