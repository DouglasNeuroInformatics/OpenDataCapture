import * as lib from '@open-data-capture/instrument-library';
import { describe, expect, it } from 'vitest';

import { InstrumentInterpreter } from './index.js';

describe('InstrumentInterpreter', () => {
  const interpreter = new InstrumentInterpreter();

  it('should evaluate the brief psychiatric rating scale', () => {
    expect(interpreter.interpret(lib.briefPsychiatricRatingScale.bundle)).resolves.toBeInstanceOf(Object);
  });
  it('should evaluate the enhanced demographics questionnaire', () => {
    expect(interpreter.interpret(lib.enhancedDemographicsQuestionnaire.bundle)).resolves.toBeInstanceOf(Object);
  });
  it('should evaluate the happiness questionnaire', () => {
    expect(interpreter.interpret(lib.happinessQuestionnaire.bundle)).resolves.toBeInstanceOf(Object);
  });
  it('should evaluate the mini mental state examination', () => {
    expect(interpreter.interpret(lib.miniMentalStateExamination.bundle)).resolves.toBeInstanceOf(Object);
  });
  it('should evaluate the montreal cognitive assessment', () => {
    expect(interpreter.interpret(lib.montrealCognitiveAssessment.bundle)).resolves.toBeInstanceOf(Object);
  });
  it('should evaluate the click task', () => {
    expect(interpreter.interpret(lib.clickTask.bundle)).resolves.toBeInstanceOf(Object);
  });
});
