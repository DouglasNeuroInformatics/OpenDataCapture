import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { InstrumentRecord as InstrumentRecordInterface } from 'common';
import mongoose from 'mongoose';

import { Instrument } from './instrument.schema';

@Schema({ strict: true })
export class InstrumentRecord implements InstrumentRecordInterface {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'Instrument' })
  instrument: any;

  @Prop({ required: true })
  subjectId: string;

  @Prop({ required: true, type: Object })
  responses: Record<string, any>;
}

export type InstrumentRecordDocument = mongoose.HydratedDocument<InstrumentRecord>;

export const InstrumentRecordSchema = SchemaFactory.createForClass(InstrumentRecord);
