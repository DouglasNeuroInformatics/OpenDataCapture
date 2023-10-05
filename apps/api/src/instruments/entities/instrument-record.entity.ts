import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { BaseInstrument, Group, InstrumentKind, InstrumentRecord, Subject } from '@open-data-capture/types';
import { type HydratedDocument, Schema as MongooseSchema } from 'mongoose';

import { GroupEntity } from '@/groups/entities/group.entity';
import { SubjectEntity } from '@/subjects/entities/subject.entity';

import { InstrumentEntity } from './instrument.entity';

@Schema({ strict: false })
export class InstrumentRecordEntity<TData = unknown> implements InstrumentRecord<BaseInstrument> {
  static readonly modelName = 'InstrumentRecord';

  @Prop({ required: true, type: MongooseSchema.Types.Mixed })
  data: TData;

  @Prop({ ref: GroupEntity.modelName, required: false, type: MongooseSchema.Types.ObjectId })
  group?: Group;

  @Prop({ ref: InstrumentEntity.modelName, required: true, type: MongooseSchema.Types.ObjectId })
  instrument: BaseInstrument;

  @Prop({ enum: ['form'] satisfies InstrumentKind[], required: true, type: String })
  kind: InstrumentKind;

  @Prop({ ref: SubjectEntity.modelName, required: true, type: MongooseSchema.Types.ObjectId })
  subject: Subject;

  @Prop({ required: true })
  time: number;
}

export type InstrumentRecordDocument = HydratedDocument<InstrumentRecordEntity>;

export const InstrumentRecordSchema = SchemaFactory.createForClass(InstrumentRecordEntity);
