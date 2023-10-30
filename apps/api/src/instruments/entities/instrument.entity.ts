import { EntitySchema } from '@douglasneuroinformatics/nestjs/core';
import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import type * as Types from '@open-data-capture/common/instrument';
import type { HydratedDocument } from 'mongoose';

import type { BaseInstrumentEntity } from './base-instrument.entity';

@EntitySchema({
  discriminatorKey: 'kind',
  virtuals: {}
})
export class InstrumentEntity<TData = unknown, TLanguage extends Types.InstrumentLanguage = Types.InstrumentLanguage>
  implements BaseInstrumentEntity<TData, TLanguage>
{
  static readonly modelName = 'Instrument';

  @ApiProperty({ description: 'The content in the instrument to be rendered to the user' })
  @Prop({ required: true, type: Object })
  content: unknown;

  @ApiProperty({ description: 'Details of the instrument to be displayed to the user' })
  @Prop({ required: true, type: Object })
  details: Types.InstrumentDetails<TLanguage>;

  @ApiProperty({ description: 'The discriminator key for the type of instrument' })
  @Prop({ enum: ['form'] satisfies Types.InstrumentKind[], required: true, type: String })
  kind: Types.InstrumentKind;

  @ApiProperty({ description: 'The language(s) in which the instrument is written' })
  @Prop({ required: true, type: Object })
  language: TLanguage;

  @ApiProperty({ description: 'The name of the instrument, which must be unique for a given version ' })
  @Prop({ required: true, unique: true })
  name: string;

  @ApiProperty({ description: 'The source code for the factory function used to create the instrument' })
  @Prop({ required: true, type: String })
  source: string;

  @ApiProperty({ description: 'A list of tags that users can use to filter instruments' })
  @Prop({ required: true, type: Object })
  tags: Types.InstrumentUIOption<TLanguage, string[]>;

  @ApiProperty({ description: 'The Zod schema for the data derived from the instrument' })
  @Prop({ required: true, type: Object })
  validationSchema: Zod.ZodType<TData>;

  @ApiProperty({ description: 'The version of the instrument' })
  @Prop({ required: true })
  version: number;
}

export type InstrumentDocument = HydratedDocument<InstrumentEntity>;

export const InstrumentSchema = SchemaFactory.createForClass(InstrumentEntity);
