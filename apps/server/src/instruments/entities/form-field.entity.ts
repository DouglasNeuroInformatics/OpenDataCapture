import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { BaseFormField, FormFieldKind, NumberFieldVariant, StringFieldVariant } from '@ddcp/common';

@Schema({ strict: 'throw' })
export class FormFieldEntity implements BaseFormField {
  @Prop({ enum: FormFieldKind, required: true })
  kind: FormFieldKind;
  
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  label: string;

  @Prop({ required: false })
  description?: string;

  @Prop({ required: true, type: String })
  variant: StringFieldVariant | NumberFieldVariant;

  @Prop({ required: true })
  isRequired: boolean;
}

export const FormFieldSchema = SchemaFactory.createForClass(FormFieldEntity);