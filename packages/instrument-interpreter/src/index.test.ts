import { describe, expect, it } from 'bun:test';

import {
  briefPsychiatricRatingScale,
  clickTask,
  enhancedDemographicsQuestionnaire,
  happinessQuestionnaire,
  miniMentalStateExamination,
  montrealCognitiveAssessment
} from '@open-data-capture/instrument-library';

import { InstrumentInterpreter } from './index.js';

describe('InstrumentInterpreter', () => {
  const interpreter = new InstrumentInterpreter();

  it('should evaluate the brief psychiatric rating scale', () => {
    expect(interpreter.interpret(briefPsychiatricRatingScale.bundle)).resolves.toBeObject();
  });
  it('should evaluate the enhanced demographics questionnaire', () => {
    expect(interpreter.interpret(enhancedDemographicsQuestionnaire.bundle)).resolves.toBeObject();
  });
  it('should evaluate the happiness questionnaire', () => {
    expect(interpreter.interpret(happinessQuestionnaire.bundle)).resolves.toBeObject();
  });
  it('should evaluate the mini mental state examination', () => {
    expect(interpreter.interpret(miniMentalStateExamination.bundle)).resolves.toBeObject();
  });
  it('should evaluate the montreal cognitive assessment', () => {
    expect(interpreter.interpret(montrealCognitiveAssessment.bundle)).resolves.toBeObject();
  });
  it('should evaluate the click task', () => {
    expect(interpreter.interpret(clickTask.bundle)).resolves.toBeObject();
  });
});
