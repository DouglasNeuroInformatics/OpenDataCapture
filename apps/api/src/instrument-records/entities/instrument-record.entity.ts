export class InstrumentRecordEntity {
  static readonly modelName = 'InstrumentRecord';

  assignmentId?: string;

  computedMeasures?: Record<string, number>;

  data: unknown;

  date: Date;

  groupId?: string;

  instrumentId: string;

  subjectIdentifier: string;
}
