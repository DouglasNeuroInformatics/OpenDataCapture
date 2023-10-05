import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { type FormDetails, type Language } from '@open-data-capture/types';

@Schema({ strict: 'throw' })
export class FormDetailsEntity implements FormDetails {
  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  estimatedDuration: number;

  @Prop({ required: true })
  instructions: string;

  @Prop({ enum: ['en', 'fr'] satisfies Language[], required: true, type: String })
  language: Language;

  @Prop({ required: true })
  title: string;
}

export const FormDetailsSchema = SchemaFactory.createForClass(FormDetailsEntity);
