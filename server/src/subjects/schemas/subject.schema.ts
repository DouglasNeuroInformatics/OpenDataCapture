import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { SubjectDemographicsInterface, SubjectInterface } from 'common';
import { HydratedDocument } from 'mongoose';

import { SubjectDemographicsSchema } from './subject-demographics.schema';

@Schema({ strict: true, timestamps: true })
export class Subject implements SubjectInterface {
  @Prop({ required: true })
  identifier: string;

  @Prop({ required: true, type: SubjectDemographicsSchema })
  demographics: SubjectDemographicsInterface;
}

export type SubjectDocument = HydratedDocument<Subject>;

export const SubjectSchema = SchemaFactory.createForClass(Subject);
