import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { BaseFormField, type FormFieldKind } from '@douglasneuroinformatics/common';

@Schema({ strict: false })
export class FormFieldEntity implements BaseFormField {
  @Prop({ enum: ['array', 'binary', 'date', 'numeric', 'options', 'text'] satisfies FormFieldKind[], required: true })
  kind: FormFieldKind;

  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  label: string;

  @Prop({ required: false })
  description?: string;

  @Prop({ required: true, type: String })
  variant: string;

  @Prop({ required: true })
  isRequired: boolean;
}

export const FormFieldSchema = SchemaFactory.createForClass(FormFieldEntity);
