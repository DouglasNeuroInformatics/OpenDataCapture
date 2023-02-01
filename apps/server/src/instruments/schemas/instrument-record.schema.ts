import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import mongoose from 'mongoose';

import { Instrument } from './instrument.schema';

import { Subject } from '@/subjects/schemas/subject.schema';

@Schema({ strict: true })
export class InstrumentRecord {
  @Prop({ default: new Date(), required: true })
  dateCollected: Date;

  @Prop({ required: true, ref: Instrument.name, type: mongoose.Schema.Types.ObjectId })
  instrument: Instrument;

  @Prop({ required: true, ref: Subject.name, type: mongoose.Schema.Types.ObjectId })
  subject: Subject;

  @Prop({ required: true, type: Object })
  data: Record<string, any>;
}

export type InstrumentRecordDocument = mongoose.HydratedDocument<InstrumentRecord>;

export const InstrumentRecordSchema = SchemaFactory.createForClass(InstrumentRecord);
