import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { InstrumentRecord as InstrumentRecordInterface } from 'common';
import mongoose from 'mongoose';

import { Instrument } from './instrument.schema';

import { Subject } from '@/subjects/schemas/subject.schema';

@Schema({ strict: true })
export class InstrumentRecord implements InstrumentRecordInterface {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'Instrument' })
  instrument: Instrument;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'Subject' })
  subject: Subject;

  @Prop({ required: true, type: Object })
  responses: Record<string, any>;
}

export type InstrumentRecordDocument = mongoose.HydratedDocument<InstrumentRecord>;

export const InstrumentRecordSchema = SchemaFactory.createForClass(InstrumentRecord);
