import { describe, expect, it } from 'bun:test';

import briefPsychiatricRatingScale from '@open-data-capture/instrument-library/forms/brief-psychiatric-rating-scale.js';
import enhancedDemographicsQuestionnaire from '@open-data-capture/instrument-library/forms/enhanced-demographics-questionnaire.js';
import happinessQuestionnaire from '@open-data-capture/instrument-library/forms/happiness-questionnaire.js';
import miniMentalStateExamination from '@open-data-capture/instrument-library/forms/mini-mental-state-examination.js';
import montrealCognitiveAssessment from '@open-data-capture/instrument-library/forms/montreal-cognitive-assessment.js';

import { $Instrument } from './instrument';

describe('$Instrument', () => {
  it('should parse the brief psychiatric rating scale', () => {
    expect($Instrument.parse(briefPsychiatricRatingScale)).toMatchObject(briefPsychiatricRatingScale);
  });
  it('should parse the enhanced demographics questionnaire', () => {
    expect($Instrument.parse(enhancedDemographicsQuestionnaire)).toMatchObject(enhancedDemographicsQuestionnaire);
  });
  it('should parse the happiness questionnaire', () => {
    expect($Instrument.parse(happinessQuestionnaire)).toMatchObject(happinessQuestionnaire);
  });
  it('should parse the mini mental state examination', () => {
    expect($Instrument.parse(miniMentalStateExamination)).toMatchObject(miniMentalStateExamination);
  });
  it('should parse the montreal cognitive assessment', () => {
    expect($Instrument.parse(montrealCognitiveAssessment)).toMatchObject(montrealCognitiveAssessment);
  });
});
