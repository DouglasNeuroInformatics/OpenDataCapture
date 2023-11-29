import { EntitySchema } from '@douglasneuroinformatics/nestjs/core';
import { Prop, SchemaFactory } from '@nestjs/mongoose';
import type { InstrumentRecord } from '@open-data-capture/common/instrument-records';
import { type HydratedDocument, Schema as MongooseSchema } from 'mongoose';

import { GroupEntity } from '@/groups/entities/group.entity';
import { SubjectEntity } from '@/subjects/entities/subject.entity';

@EntitySchema<Omit<InstrumentRecord, 'instrument'>>()
export class InstrumentRecordEntity {
  static readonly modelName = 'InstrumentRecord';

  @Prop({ required: false, type: String })
  assignmentId?: string;

  computedMeasures?: Record<string, number>;

  @Prop({ required: true, type: Object })
  data: unknown;

  @Prop({ required: true, type: Object })
  date: Date;

  @Prop({ ref: GroupEntity.modelName, required: false, type: MongooseSchema.Types.ObjectId })
  group?: GroupEntity;

  @Prop({ required: true })
  instrumentId: string;

  @Prop({ ref: SubjectEntity.modelName, required: true, type: MongooseSchema.Types.ObjectId })
  subject: SubjectEntity;
}

export type InstrumentRecordDocument = HydratedDocument<InstrumentRecordEntity>;

export const InstrumentRecordSchema = SchemaFactory.createForClass(InstrumentRecordEntity);
