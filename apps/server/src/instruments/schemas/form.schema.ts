import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { FormFieldVariant } from '../enums/form-field-variant.enum';
import { BaseInstrument } from '../interfaces/base-instrument.interface';

import { Instrument } from './instrument.schema';

@Schema({ strict: 'throw' })
export class FormField {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  label: string;

  @Prop({ required: false })
  description?: string;

  @Prop({ enum: FormFieldVariant, required: true, type: String })
  variant: FormFieldVariant;

  @Prop({ required: true })
  isRequired: boolean;
}

@Schema({ strict: 'throw' })
export class Form extends Instrument implements BaseInstrument {
  @Prop({ required: true, type: [FormField] })
  data: FormField[];
}

export const FormSchema = SchemaFactory.createForClass(Form);
