import type { BaseFormField, FormFieldKind } from '@douglasneuroinformatics/form-types';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ strict: false })
export class FormFieldEntity implements BaseFormField {
  @Prop({ required: false })
  description?: string;

  @Prop({ required: true })
  isRequired: boolean;

  @Prop({ enum: ['array', 'binary', 'date', 'numeric', 'options', 'text'] satisfies FormFieldKind[], required: true })
  kind: FormFieldKind;

  @Prop({ required: true })
  label: string;

  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true, type: String })
  variant: string;
}

export const FormFieldSchema = SchemaFactory.createForClass(FormFieldEntity);
