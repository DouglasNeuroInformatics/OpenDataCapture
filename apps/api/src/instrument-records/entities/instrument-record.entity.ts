import { EntitySchema } from '@douglasneuroinformatics/nestjs/core';
import { Prop, SchemaFactory } from '@nestjs/mongoose';
import type { BaseInstrument } from '@open-data-capture/common/instrument';
import type { InstrumentRecord } from '@open-data-capture/common/instrument-records';
import { type HydratedDocument, Schema as MongooseSchema } from 'mongoose';

import { GroupEntity } from '@/groups/entities/group.entity';
import { InstrumentEntity } from '@/instruments/entities/instrument.entity';
import { SubjectEntity } from '@/subjects/entities/subject.entity';

@EntitySchema<InstrumentRecord>()
export class InstrumentRecordEntity {
  static readonly modelName = 'InstrumentRecord';

  computedMeasures?: Record<string, number>;
  
  @Prop({ required: true, type: Object })
  data: unknown;

  @Prop({ required: true, type: Object })
  date: Date;

  @Prop({ ref: GroupEntity.modelName, required: false, type: MongooseSchema.Types.ObjectId })
  group?: GroupEntity;

  @Prop({ ref: InstrumentEntity.modelName, required: true, type: MongooseSchema.Types.ObjectId })
  instrument: BaseInstrument;

  @Prop({ ref: SubjectEntity.modelName, required: true, type: MongooseSchema.Types.ObjectId })
  subject: SubjectEntity;
}

export type InstrumentRecordDocument = HydratedDocument<InstrumentRecordEntity>;

export const InstrumentRecordSchema = SchemaFactory.createForClass(InstrumentRecordEntity);
