import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { type InstrumentKind } from '@open-data-capture/types';
import { type HydratedDocument } from 'mongoose';

import { BaseInstrumentEntity } from './base-instrument.entity';

@Schema({ discriminatorKey: 'kind', strict: false, timestamps: true })
export class InstrumentEntity implements BaseInstrumentEntity {
  static readonly modelName = 'Instrument';

  @Prop({ enum: ['form'] satisfies InstrumentKind[], required: true, type: String })
  kind: InstrumentKind;

  @Prop({ required: true })
  identifier: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  tags: string[];

  @Prop({ required: true })
  version: number;

  content: any;
}

export type InstrumentDocument = HydratedDocument<InstrumentEntity>;

export const InstrumentSchema = SchemaFactory.createForClass(InstrumentEntity);
