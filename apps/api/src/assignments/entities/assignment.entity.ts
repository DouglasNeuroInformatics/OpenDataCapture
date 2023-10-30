import { EntitySchema } from '@douglasneuroinformatics/nestjs/core';
import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { type Assignment, type AssignmentStatus } from '@open-data-capture/common/assignment';
import { Schema as MongooseSchema } from 'mongoose';

import type { FormInstrumentEntity } from '@/instruments/entities/form-instrument.entity';
import { InstrumentEntity } from '@/instruments/entities/instrument.entity';
import { SubjectEntity } from '@/subjects/entities/subject.entity';

@EntitySchema()
export class AssignmentEntity implements Assignment {
  static readonly modelName = 'Assignment';

  @ApiProperty()
  @Prop({ required: true, type: Object })
  assignedAt: Date;

  @ApiProperty()
  @Prop({ required: true, type: Object })
  expiresAt: Date;

  @Prop({ ref: InstrumentEntity.modelName, required: true, type: MongooseSchema.Types.ObjectId })
  instrument: FormInstrumentEntity;

  @ApiProperty()
  @Prop({ enum: ['CANCELED', 'COMPLETE', 'EXPIRED', 'OUTSTANDING'] satisfies AssignmentStatus[], type: String })
  status: AssignmentStatus;

  @ApiProperty()
  @Prop({ ref: SubjectEntity.modelName, required: true, type: MongooseSchema.Types.ObjectId })
  subject: SubjectEntity;
}

export const AssignmentSchema = SchemaFactory.createForClass(AssignmentEntity);
