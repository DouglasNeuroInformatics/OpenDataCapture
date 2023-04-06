export type InstrumentRecordsExport = Array<{
  subjectId: string;
  subjectAge: number;
  subjectSex: string;
  instrumentName: string;
  instrumentVersion: number;
  timestamp: string;
  measure: string;
  value: any;
}>;
