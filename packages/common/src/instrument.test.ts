import briefPsychiatricRatingScale from '@open-data-capture/instrument-library/forms/brief-psychiatric-rating-scale.js';
import enhancedDemographicsQuestionnaire from '@open-data-capture/instrument-library/forms/enhanced-demographics-questionnaire.js';
import happinessQuestionnaire from '@open-data-capture/instrument-library/forms/happiness-questionnaire.js';
import miniMentalStateExamination from '@open-data-capture/instrument-library/forms/mini-mental-state-examination.js';
import montrealCognitiveAssessment from '@open-data-capture/instrument-library/forms/montreal-cognitive-assessment.js';
import { describe, expect, it } from 'vitest';

import { $AnyInstrument } from './instrument.js';

describe('$AnyInstrument', () => {
  it('should parse the brief psychiatric rating scale', () => {
    expect($AnyInstrument.parse(briefPsychiatricRatingScale)).toMatchObject({
      name: briefPsychiatricRatingScale.name
    });
  });
  it('should parse the enhanced demographics questionnaire', () => {
    expect($AnyInstrument.parse(enhancedDemographicsQuestionnaire)).toMatchObject({
      name: enhancedDemographicsQuestionnaire.name
    });
  });
  it('should parse the happiness questionnaire', () => {
    expect($AnyInstrument.parse(happinessQuestionnaire)).toMatchObject({
      name: happinessQuestionnaire.name
    });
  });
  it('should parse the mini mental state examination', () => {
    expect($AnyInstrument.parse(miniMentalStateExamination)).toMatchObject({
      name: miniMentalStateExamination.name
    });
  });
  it('should parse the montreal cognitive assessment', () => {
    expect($AnyInstrument.parse(montrealCognitiveAssessment)).toMatchObject({
      name: montrealCognitiveAssessment.name
    });
  });
});
