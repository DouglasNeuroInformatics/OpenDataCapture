import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { InstrumentDetailsInterface, InstrumentLanguage } from 'common';

@Schema()
export class InstrumentDetails implements InstrumentDetailsInterface {
  @Prop({ required: true })
  description: string;

  @Prop({ required: true, type: String })
  language: InstrumentLanguage;

  @Prop({ required: true })
  instructions: string;

  @Prop({ required: true })
  estimatedDuration: number;

  @Prop({ required: true })
  version: number;
}

export const InstrumentDetailsSchema = SchemaFactory.createForClass(InstrumentDetails);
