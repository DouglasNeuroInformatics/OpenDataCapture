import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { type Sex, Subject as SubjectInterface, sexOptions } from 'common';
import { HydratedDocument } from 'mongoose';

@Schema({ strict: true, timestamps: true })
export class Subject implements SubjectInterface {
  @Prop({ required: true })
  identifier: string;

  @Prop({ required: true })
  dateOfBirth: Date;

  @Prop({ enum: sexOptions, required: true })
  sex: Sex;

  @Prop({ trim: true })
  firstName?: string;

  @Prop({ trim: true })
  lastName?: string;

  @Prop({ length: 3 })
  forwardSortationArea?: string;
}

export type SubjectDocument = HydratedDocument<Subject>;

export const SubjectSchema = SchemaFactory.createForClass(Subject);
