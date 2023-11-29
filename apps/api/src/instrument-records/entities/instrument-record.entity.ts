import type { ObjectIdLike } from '@douglasneuroinformatics/nestjs/modules';

export class InstrumentRecordEntity {
  static readonly modelName = 'InstrumentRecord';

  assignmentId?: string;

  computedMeasures?: Record<string, number>;

  data: unknown;

  date: Date;

  groupId?: ObjectIdLike;

  instrumentId: ObjectIdLike;

  subjectIdentifier: ObjectIdLike;
}
