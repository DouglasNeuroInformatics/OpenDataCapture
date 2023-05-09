export interface FormInstrumentRecordsSummary {
  count: number;
  centralTendency?: {
    // Measures
    [key: string]: {
      mean: number;
      std: number;
    };
  };
}
