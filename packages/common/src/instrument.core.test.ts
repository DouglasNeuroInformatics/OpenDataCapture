/// <reference types="@open-data-capture/instrument-library" />

import briefPsychiatricRatingScale from '@open-data-capture/instrument-library/forms/brief-psychiatric-rating-scale.js';
import enhancedDemographicsQuestionnaire from '@open-data-capture/instrument-library/forms/enhanced-demographics-questionnaire.js';
import happinessQuestionnaire from '@open-data-capture/instrument-library/forms/happiness-questionnaire.js';
import miniMentalStateExamination from '@open-data-capture/instrument-library/forms/mini-mental-state-examination.js';
import montrealCognitiveAssessment from '@open-data-capture/instrument-library/forms/montreal-cognitive-assessment.js';
import clickTask from '@open-data-capture/instrument-library/interactive/click-task.jsx';
import { describe, expect, it } from 'vitest';

import { $AnyInstrument } from './instrument.core.js';

describe('$AnyInstrument', () => {
  describe('form instruments', () => {
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
  /**
   * For interactive instruments, cannot use `.toMatchObject`, since the render function returned by
   * Zod is not named "render", which causes it to fail the comparison, despise the same signature.
   */
  describe('interactive instruments', () => {
    it('should parse the click task', () => {
      expect($AnyInstrument.safeParseAsync(clickTask)).resolves.toMatchObject({ success: true });
    });
  });
});
