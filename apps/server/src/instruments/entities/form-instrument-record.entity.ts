import { Prop, SchemaFactory } from '@nestjs/mongoose';

import { FormInstrumentRecord, Group, Subject } from '@douglasneuroinformatics/common';

import { FormInstrumentEntity } from './form-instrument.entity';

export class FormInstrumentRecordEntity implements FormInstrumentRecord {
  kind: 'form';
  dateCollected: Date;
  instrument: FormInstrumentEntity;
  group: Group;
  subject: Subject;

  @Prop({ required: true, type: Object })
  data: Record<string, any>;
}

export const FormInstrumentRecordSchema = SchemaFactory.createForClass(FormInstrumentRecordEntity);
