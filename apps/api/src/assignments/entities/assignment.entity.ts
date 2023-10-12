import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { type Assignment, type AssignmentStatus } from '@open-data-capture/types';
import { type HydratedDocument } from 'mongoose';

import { type SubjectDocument, SubjectSchema } from '@/subjects/entities/subject.entity';

@Schema({ strict: 'throw', timestamps: true })
export class AssignmentEntity implements Assignment {
  static readonly modelName = 'Assignment';

  @ApiProperty()
  @Prop({ enum: ['CANCELED', 'COMPLETE', 'EXPIRED', 'OUTSTANDING'] satisfies AssignmentStatus[], type: String })
  status: AssignmentStatus;

  @ApiProperty()
  @Prop({ required: true, type: SubjectSchema })
  subject: SubjectDocument;

  @ApiProperty()
  @Prop({ required: true })
  timeAssigned: number;

  @ApiProperty()
  @Prop({ required: true })
  timeExpires: number;

  @ApiProperty()
  @Prop({ required: true })
  title: string;
}

export type AssignmentDocument = HydratedDocument<AssignmentEntity>;

export const AssignmentSchema = SchemaFactory.createForClass(AssignmentEntity);
