import type { JSONSchemaType } from '@douglasneuroinformatics/ajv';
import type FormTypes from '@douglasneuroinformatics/form-types';
import { EntitySchema } from '@douglasneuroinformatics/nestjs/core';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import type BaseTypes from '@open-data-capture/types';
import type { HydratedDocument } from 'mongoose';

abstract class BaseInstrumentEntity<TLanguage extends BaseTypes.InstrumentLanguage>
  implements BaseTypes.BaseInstrument<TLanguage>
{
  language: TLanguage;
  name: string;
  tags: BaseTypes.InstrumentUIOption<TLanguage, string[]>;
  version: number;
  abstract content: unknown;
  abstract kind: BaseTypes.InstrumentKind;
}

@EntitySchema({ discriminatorKey: 'kind' })
export class InstrumentEntity<TLanguage extends BaseTypes.InstrumentLanguage = BaseTypes.InstrumentLanguage>
  implements BaseInstrumentEntity<TLanguage>
{
  static readonly modelName = 'Instrument';

  @ApiProperty({ description: 'The content in the instrument to be rendered to the user' })
  content: unknown;

  @ApiProperty({ description: 'The discriminator key for the type of instrument' })
  @Prop({ enum: ['form'] satisfies BaseTypes.InstrumentKind[], required: true, type: String })
  kind: BaseTypes.InstrumentKind;

  @ApiProperty({ description: 'The language(s) in which the instrument is written' })
  @Prop({ required: true, type: Object })
  language: TLanguage;

  @ApiProperty({ description: 'The name of the instrument, which must be unique for a given version ' })
  @Prop({ required: true, unique: true })
  name: string;

  @ApiProperty({ description: 'A list of tags that users can use to filter instruments' })
  @Prop({ required: true, type: Object })
  tags: BaseTypes.InstrumentUIOption<TLanguage, string[]>;

  @ApiProperty({ description: 'The version of the instrument' })
  @Prop({ required: true })
  version: number;
}

export type InstrumentDocument = HydratedDocument<InstrumentEntity>;

export const InstrumentSchema = SchemaFactory.createForClass(InstrumentEntity);

@Schema()
export class FormInstrumentEntity<
    TData extends FormTypes.FormDataType = FormTypes.FormDataType,
    TLanguage extends BaseTypes.InstrumentLanguage = BaseTypes.InstrumentLanguage
  >
  extends BaseInstrumentEntity<TLanguage>
  implements BaseTypes.FormInstrument<TData, TLanguage>
{
  @ApiProperty()
  @Prop({ required: true, type: Object })
  declare content: BaseTypes.FormInstrumentContent<TLanguage, TData>;

  @ApiProperty()
  @Prop({ required: true, type: Object })
  declare details: BaseTypes.FormInstrumentDetails<TLanguage>;

  declare kind: 'form';

  @ApiProperty()
  @Prop({ required: false, type: Object })
  declare measures?: BaseTypes.FormInstrumentMeasures<TLanguage, TData>;

  @ApiProperty()
  @Prop({ required: true, type: Object })
  declare validationSchema: JSONSchemaType<TData>;
}

export const FormInstrumentSchema = SchemaFactory.createForClass(FormInstrumentEntity);
