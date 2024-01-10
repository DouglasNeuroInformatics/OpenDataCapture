import { describe, expect, it } from 'bun:test';

import briefPsychiatricRatingScale from '@open-data-capture/instruments/forms/brief-psychiatric-rating-scale';
import enhancedDemographicsQuestionnaire from '@open-data-capture/instruments/forms/enhanced-demographics-questionnaire';
import happinessQuestionnaire from '@open-data-capture/instruments/forms/happiness-questionnaire';
import miniMentalStateExamination from '@open-data-capture/instruments/forms/mini-mental-state-examination';
import montrealCognitiveAssessment from '@open-data-capture/instruments/forms/montreal-cognitive-assessment';

import { $InstrumentDef } from './instrument';

describe('$InstrumentDef', () => {
  it('should parse the brief psychiatric rating scale', () => {
    expect($InstrumentDef.parse(briefPsychiatricRatingScale)).toMatchObject(briefPsychiatricRatingScale);
  });
  it('should parse the enhanced demographics questionnaire', () => {
    expect($InstrumentDef.parse(enhancedDemographicsQuestionnaire)).toMatchObject(enhancedDemographicsQuestionnaire);
  });
  it('should parse the happiness questionnaire', () => {
    expect($InstrumentDef.parse(happinessQuestionnaire)).toMatchObject(happinessQuestionnaire);
  });
  it('should parse the mini mental state examination', () => {
    expect($InstrumentDef.parse(miniMentalStateExamination)).toMatchObject(miniMentalStateExamination);
  });
  it('should parse the montreal cognitive assessment', () => {
    expect($InstrumentDef.parse(montrealCognitiveAssessment)).toMatchObject(montrealCognitiveAssessment);
  });
});
