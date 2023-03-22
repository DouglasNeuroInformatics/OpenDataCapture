import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { HydratedDocument } from 'mongoose';

import { InstrumentKind } from '../enums/instrument-kind.enum';
import { InstrumentLanguage } from '../enums/instrument-language.enum';
import { BaseInstrument } from '../interfaces/base-instrument.interface';

type InstrumentDetailsType = BaseInstrument['details'];

@Schema({ strict: 'throw', timestamps: true })
class InstrumentDetails implements InstrumentDetailsType {
  @Prop({ required: true })
  description: string;

  @Prop({ required: true, enum: InstrumentLanguage, type: String })
  language: InstrumentLanguage;

  @Prop({ required: true })
  instructions: string;

  @Prop({ required: true })
  estimatedDuration: number;

  @Prop({ required: true })
  version: number;
}

const InstrumentDetailsSchema = SchemaFactory.createForClass(InstrumentDetails);

@Schema({ discriminatorKey: 'kind', strict: 'throw', timestamps: true })
export class Instrument implements Omit<BaseInstrument, 'data'> {
  @Prop({ enum: InstrumentKind, required: true, type: String })
  kind: InstrumentKind;

  @Prop({ required: true, unique: true })
  title: string;

  @Prop({ required: true, type: InstrumentDetailsSchema })
  details: InstrumentDetails;
}

export type InstrumentDocument = HydratedDocument<Instrument>;

export const InstrumentSchema = SchemaFactory.createForClass(Instrument);
