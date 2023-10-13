import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { type HydratedDocument } from 'mongoose';

@Schema({ strict: 'throw', timestamps: true })
export class InstrumentEntity {
  static readonly modelName = 'Instrument2';

  @ApiProperty()
  @Prop({ required: true, unique: true })
  name: string;
}

export type InstrumentDocument = HydratedDocument<InstrumentEntity>;

export const InstrumentSchema = SchemaFactory.createForClass(InstrumentEntity);
