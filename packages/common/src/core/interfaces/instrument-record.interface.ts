export interface InstrumentRecord {
  dateCollected: Date;
  clinic: string;
  instrumentName: string;
  subjectDemographics: {
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
  };
  data: any;
}
