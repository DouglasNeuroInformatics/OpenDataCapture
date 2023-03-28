import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { BaseInstrument, InstrumentKind } from '@ddcp/common';
import { HydratedDocument } from 'mongoose';

@Schema({ discriminatorKey: 'kind', strict: 'throw', timestamps: true })
export class InstrumentEntity implements BaseInstrument {
  static readonly modelName = 'Instrument';

  @Prop({ enum: InstrumentKind, required: true, type: String })
  kind: InstrumentKind;

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
