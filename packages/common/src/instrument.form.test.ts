import { describe, expect, it } from 'bun:test';

import briefPsychiatricRatingScale from '@open-data-capture/instruments/forms/brief-psychiatric-rating-scale';
import enhancedDemographicsQuestionnaire from '@open-data-capture/instruments/forms/enhanced-demographics-questionnaire';
import happinessQuestionnaire from '@open-data-capture/instruments/forms/happiness-questionnaire';
import miniMentalStateExamination from '@open-data-capture/instruments/forms/mini-mental-state-examination';
import montrealCognitiveAssessment from '@open-data-capture/instruments/forms/montreal-cognitive-assessment';

import { $FormInstrument } from './instrument.form';

describe('$FormInstrument', () => {
  it('should parse the brief psychiatric rating scale', () => {
    expect($FormInstrument.parse(briefPsychiatricRatingScale)).toMatchObject(briefPsychiatricRatingScale);
  });
  it('should parse the enhanced demographics questionnaire', () => {
    expect($FormInstrument.parse(enhancedDemographicsQuestionnaire)).toMatchObject(
      enhancedDemographicsQuestionnaire
    );
  });
  it('should parse the happiness questionnaire', () => {
    expect($FormInstrument.parse(happinessQuestionnaire)).toMatchObject(happinessQuestionnaire);
  });
  it('should parse the mini mental state examination', () => {
    expect($FormInstrument.parse(miniMentalStateExamination)).toMatchObject(miniMentalStateExamination);
  });
  it('should parse the montreal cognitive assessment', () => {
    expect($FormInstrument.parse(montrealCognitiveAssessment)).toMatchObject(montrealCognitiveAssessment);
  });
});
