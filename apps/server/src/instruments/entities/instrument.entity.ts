import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { BaseInstrument, type InstrumentKind } from '@douglasneuroinformatics/common';
import { HydratedDocument } from 'mongoose';

@Schema({ discriminatorKey: 'kind', strict: false, timestamps: true })
export class InstrumentEntity implements BaseInstrument {
  static readonly modelName = 'Instrument';

  @Prop({ enum: ['form'] satisfies InstrumentKind[], required: true, type: String })
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
