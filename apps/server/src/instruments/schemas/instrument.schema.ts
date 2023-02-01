import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { InstrumentDetailsInterface, InstrumentInterface, InstrumentKind, instrumentKindOptions } from 'common';
import { HydratedDocument } from 'mongoose';

import { InstrumentDetailsSchema } from './instrument-details.schema';

@Schema({ discriminatorKey: 'kind', strict: true, timestamps: true })
export class Instrument implements Omit<InstrumentInterface, 'data'> {
  @Prop({ required: true, unique: true })
  title: string;

  @Prop({ enum: instrumentKindOptions, required: true })
  kind: InstrumentKind;

  @Prop({ required: true, type: InstrumentDetailsSchema })
  details: InstrumentDetailsInterface;
}

export type InstrumentDocument = HydratedDocument<Instrument>;

export const InstrumentSchema = SchemaFactory.createForClass(Instrument);
