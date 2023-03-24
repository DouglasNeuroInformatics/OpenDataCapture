import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import {
  FormFieldVariant,
  InstrumentDetails,
  Instrument as InstrumentInterface,
  InstrumentKind
} from '@ddcp/common/types';

@Schema({ strict: 'throw' })
export class FormField {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  label: string;

  @Prop({ required: false })
  description?: string;

  @Prop({ enum: ['TEXT'] satisfies FormFieldVariant[], required: true, type: String })
  variant: FormFieldVariant;

  @Prop({ required: true })
  isRequired: boolean;
}

export const FormFieldSchema = SchemaFactory.createForClass(FormField);

@Schema({ strict: 'throw' })
export class Form implements InstrumentInterface {
  kind: InstrumentKind & 'FORM';
  title: string;
  details: InstrumentDetails;

  @Prop({ required: true, type: [FormFieldSchema] })
  data: FormField[];
}

export const FormSchema = SchemaFactory.createForClass(Form);
