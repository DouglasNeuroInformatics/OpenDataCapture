import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { FormFieldVariant } from '../enums/form-field-variant.enum';
import { InstrumentKind } from '../enums/instrument-kind.enum';
import { BaseInstrument } from '../interfaces/base-instrument.interface';

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

export const FormFieldSchema = SchemaFactory.createForClass(FormField);

@Schema({ strict: 'throw' })
export class Form implements BaseInstrument {
  kind: InstrumentKind.Form;
  title: string;
  details: BaseInstrument['details'];

  @Prop({ required: true, type: [FormFieldSchema] })
  data: FormField[];
}

export const FormSchema = SchemaFactory.createForClass(Form);
