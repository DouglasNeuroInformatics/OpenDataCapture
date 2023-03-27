import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Sex, Subject } from '@ddcp/common';
import { HydratedDocument } from 'mongoose';

@Schema({ strict: 'throw', timestamps: true })
export class SubjectEntity implements Subject {
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

export type SubjectDocument = HydratedDocument<SubjectEntity>;

export const SubjectSchema = SchemaFactory.createForClass(SubjectEntity);
