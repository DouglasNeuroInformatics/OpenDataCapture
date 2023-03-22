import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { HydratedDocument } from 'mongoose';

import { Sex } from '../enums/sex.enum';

@Schema({ strict: 'throw', timestamps: true })
export class Subject {
  static readonly modelName = 'Subject';

  @Prop({ required: true })
  identifier: string;

  @Prop({ required: false })
  firstName?: string;

  @Prop({ required: false })
  lastName?: string;

  @Prop({ required: true })
  dateOfBirth: Date;

  @Prop({ enum: Sex, required: true, type: String })
  sex: Sex;
}

export type SubjectDocument = HydratedDocument<Subject>;

export const SubjectSchema = SchemaFactory.createForClass(Subject);
