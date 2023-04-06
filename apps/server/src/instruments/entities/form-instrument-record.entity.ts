import { Prop, SchemaFactory } from '@nestjs/mongoose';

import { FormInstrument, FormInstrumentRecord, Group, Subject } from '@ddcp/common';

export class FormInstrumentRecordEntity implements FormInstrumentRecord {
  kind: 'form';
  dateCollected: Date;
  instrument: FormInstrument;
  group: Group;
  subject: Subject;

  @Prop({ required: true, type: Object })
  data: Record<string, any>;
}

export const FormInstrumentRecordSchema = SchemaFactory.createForClass(FormInstrumentRecordEntity);
