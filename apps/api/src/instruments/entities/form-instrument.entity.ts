import type FormTypes from '@douglasneuroinformatics/form-types';
import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import type * as Types from '@open-data-capture/common/instrument';

import { BaseInstrumentEntity } from './base-instrument.entity';

@Schema({
  toObject: { virtuals: true },
  virtuals: {}
})
export class FormInstrumentEntity<
    TData extends FormTypes.FormDataType = FormTypes.FormDataType,
    TLanguage extends Types.InstrumentLanguage = Types.InstrumentLanguage
  >
  extends BaseInstrumentEntity<TData, TLanguage>
  implements Types.FormInstrument<TData, TLanguage>
{
  declare content: Types.FormInstrumentContent<TData, TLanguage>;
  declare details: Types.FormInstrumentDetails<TLanguage>;
  declare kind: 'form';

  @ApiProperty()
  declare measures?: Types.FormInstrumentMeasures<TData, TLanguage>;
}

export const FormInstrumentSchema = SchemaFactory.createForClass(FormInstrumentEntity);
