import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import {
  InstrumentDetails as InstrumentDetailsInterface,
  Instrument as InstrumentInterface,
  InstrumentKind,
  InstrumentLanguage
} from '@ddcp/types';
import { HydratedDocument } from 'mongoose';

@Schema({ strict: 'throw', timestamps: true })
class InstrumentDetails implements InstrumentDetailsInterface {
  @Prop({ required: true })
  description: string;

  @Prop({ required: true, enum: ['EN', 'FR'] satisfies InstrumentLanguage[], type: String })
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
export class Instrument implements InstrumentInterface {
  static readonly modelName = 'Instrument';

  @Prop({ enum: ['FORM'] satisfies InstrumentKind[], required: true, type: String })
  kind: InstrumentKind;

  @Prop({ required: true, unique: true })
  title: string;

  @Prop({ required: true, type: InstrumentDetailsSchema })
  details: InstrumentDetails;

  data: any;
}

export type InstrumentDocument = HydratedDocument<Instrument>;

export const InstrumentSchema = SchemaFactory.createForClass(Instrument);
