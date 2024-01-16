/// <reference types="@open-data-capture/rollup-plugin-instrument/client" />

declare module '@open-data-capture/instrument-library/forms/*' {
  const content: any;
  export default content;
}

declare module '@open-data-capture/instrument-library/interactive/*' {
  const content: any;
  export default content;
}

export const briefPsychiatricRatingScale: InstrumentLibraryItem;
export const enhancedDemographicsQuestionnaire: InstrumentLibraryItem;
export const happinessQuestionnaire: InstrumentLibraryItem;
export const miniMentalStateExamination: InstrumentLibraryItem;
export const montrealCognitiveAssessment: InstrumentLibraryItem;

export const clickTask: InstrumentLibraryItem;
