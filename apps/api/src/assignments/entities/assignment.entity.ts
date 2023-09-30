import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';

import { type Assignment, type AssignmentStatus } from '@open-data-capture/types';
import { type HydratedDocument } from 'mongoose';

@Schema({ strict: 'throw', timestamps: true })
export class AssignmentEntity implements Assignment {
  static readonly modelName = 'Assignment';

  @ApiProperty()
  @Prop({ required: true, unique: true })
  title: string;

  @ApiProperty()
  @Prop({ required: true })
  timeAssigned: number;

  @ApiProperty()
  @Prop({ required: true })
  timeExpires: number;

  @ApiProperty()
  @Prop({ enum: ['CANCELED', 'COMPLETE', 'EXPIRED', 'OUTSTANDING'] satisfies AssignmentStatus[] })
  status: AssignmentStatus;
}

export type AssignmentDocument = HydratedDocument<AssignmentEntity>;

export const AssignmentSchema = SchemaFactory.createForClass(AssignmentEntity);
