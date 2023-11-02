import { EntitySchema } from '@douglasneuroinformatics/nestjs/core';
import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import type { HydratedDocument } from 'mongoose';

@EntitySchema()
export class InstrumentEntity {
  static readonly modelName = 'Instrument';

  @ApiProperty({ description: 'The master source code for the instrument' })
  @Prop({ required: true })
  source: string;
}

export type InstrumentDocument = HydratedDocument<InstrumentEntity>;

export const InstrumentSchema = SchemaFactory.createForClass(InstrumentEntity);
