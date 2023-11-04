import type { FormDataType } from '@douglasneuroinformatics/form-types';

import type { Group } from '../group/group.types';
import type { BaseInstrument, FormInstrument } from '../instrument/instrument.types';
import type { Subject } from '../subject/subject.types';

export type InstrumentRecord<TData = unknown, TInstrument extends BaseInstrument<TData> = BaseInstrument<TData>> = {
  data: TData;
  date: Date;
  group?: Group;
  instrument: TInstrument;
  subject: Subject;
};

export type FormInstrumentRecord<TData extends FormDataType = FormDataType> = InstrumentRecord<
  TData,
  FormInstrument<TData>
>;
