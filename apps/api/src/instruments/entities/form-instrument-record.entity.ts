import type { FormInstrumentData } from '@douglasneuroinformatics/form-types';
import { Prop, SchemaFactory } from '@nestjs/mongoose';
import type { FormInstrumentRecord, Group, Subject } from '@open-data-capture/types';

import { FormInstrumentEntity } from './form-instrument.entity';

export class FormInstrumentRecordEntity<T extends FormInstrumentData = FormInstrumentData>
  implements FormInstrumentRecord<T>
{
  @Prop({ required: true, type: Object })
  data: T;
  group: Group;
  instrument: FormInstrumentEntity<T>;
  kind: 'form';
  subject: Subject;
  time: number;
}

export const FormInstrumentRecordSchema = SchemaFactory.createForClass(FormInstrumentRecordEntity);
