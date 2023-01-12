import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { InstrumentRecord as InstrumentRecordInterface, Subject } from 'common';
import mongoose from 'mongoose';

@Schema({ strict: true })
export class InstrumentRecord implements InstrumentRecordInterface {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'Subject' })
  subject: Subject;

  @Prop({ required: true })
  responses: Record<string, any>;
}

export type InstrumentRecordDocument = mongoose.HydratedDocument<InstrumentRecord>;

export const InstrumentRecordSchema = SchemaFactory.createForClass(InstrumentRecord);
