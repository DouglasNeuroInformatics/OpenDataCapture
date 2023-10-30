import type FormTypes from '@douglasneuroinformatics/form-types';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import type * as Types from '@open-data-capture/common/instrument';

import { BaseInstrumentEntity } from './base-instrument.entity';

@Schema()
export class FormInstrumentEntity<
    TData extends FormTypes.FormDataType = FormTypes.FormDataType,
    TLanguage extends Types.InstrumentLanguage = Types.InstrumentLanguage
  >
  extends BaseInstrumentEntity<TData, TLanguage>
  implements Types.FormInstrument<TData, TLanguage>
{
  @ApiProperty()
  @Prop({ required: true, type: Object })
  declare content: Types.FormInstrumentContent<TData, TLanguage>;

  declare kind: 'form';

  @ApiProperty()
  @Prop({ required: false, type: Object })
  declare measures?: Types.FormInstrumentMeasures<TData, TLanguage>;

  @ApiProperty()
  @Prop({ required: true, type: Object })
  declare validationSchema: Zod.ZodType<TData>;
}

export const FormInstrumentSchema = SchemaFactory.createForClass(FormInstrumentEntity);
