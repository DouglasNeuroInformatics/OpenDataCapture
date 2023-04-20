import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { FormDetails, type Language } from '@douglasneuroinformatics/common';

@Schema({ strict: 'throw' })
export class FormDetailsEntity implements FormDetails {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ enum: ['en', 'fr'] satisfies Language[], required: true, type: String })
  language: Language;

  @Prop({ required: true })
  instructions: string;

  @Prop({ required: true })
  estimatedDuration: number;
}

export const FormDetailsSchema = SchemaFactory.createForClass(FormDetailsEntity);
