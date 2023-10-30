import { EntitySchema } from '@douglasneuroinformatics/nestjs/core';
import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import type * as Types from '@open-data-capture/common/instrument';
import type { HydratedDocument } from 'mongoose';

import { BaseInstrumentEntity } from './base-instrument.entity';

@EntitySchema({ discriminatorKey: 'kind' })
export class InstrumentEntity<
  TData = unknown,
  TLanguage extends Types.InstrumentLanguage = Types.InstrumentLanguage
> extends BaseInstrumentEntity<TData, TLanguage> {
  static readonly modelName = 'Instrument';

  @ApiProperty({ description: 'The content in the instrument to be rendered to the user' })
  declare content: unknown;

  @ApiProperty({ description: 'The discriminator key for the type of instrument' })
  @Prop({ enum: ['form'] satisfies Types.InstrumentKind[], required: true, type: String })
  declare kind: Types.InstrumentKind;

  @ApiProperty({ description: 'The language(s) in which the instrument is written' })
  @Prop({ required: true, type: Object })
  declare language: TLanguage;

  @ApiProperty({ description: 'The name of the instrument, which must be unique for a given version ' })
  @Prop({ required: true, unique: true })
  declare name: string;

  @ApiProperty({ description: 'A list of tags that users can use to filter instruments' })
  @Prop({ required: true, type: Object })
  declare tags: Types.InstrumentUIOption<TLanguage, string[]>;

  @ApiProperty({ description: 'The version of the instrument' })
  @Prop({ required: true })
  declare version: number;
}

export type InstrumentDocument = HydratedDocument<InstrumentEntity>;

export const InstrumentSchema = SchemaFactory.createForClass(InstrumentEntity);
