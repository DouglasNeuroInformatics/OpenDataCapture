import * as lib from '@open-data-capture/instrument-library';
import { describe, expect, it } from 'vitest';

import { InstrumentInterpreter } from './index.js';

describe('InstrumentInterpreter', () => {
  const interpreter = new InstrumentInterpreter();

  it('should evaluate the brief psychiatric rating scale', async () => {
    await expect(interpreter.interpret(lib.briefPsychiatricRatingScale.bundle)).resolves.toBeInstanceOf(Object);
  });
  it('should evaluate the enhanced demographics questionnaire', async () => {
    await expect(interpreter.interpret(lib.enhancedDemographicsQuestionnaire.bundle)).resolves.toBeInstanceOf(Object);
  });
  it('should evaluate the happiness questionnaire', async () => {
    await expect(interpreter.interpret(lib.happinessQuestionnaire.bundle)).resolves.toBeInstanceOf(Object);
  });
  it('should evaluate the mini mental state examination', async () => {
    await expect(interpreter.interpret(lib.miniMentalStateExamination.bundle)).resolves.toBeInstanceOf(Object);
  });
  it('should evaluate the montreal cognitive assessment', async () => {
    await expect(interpreter.interpret(lib.montrealCognitiveAssessment.bundle)).resolves.toBeInstanceOf(Object);
  });
  it('should evaluate the click task', async () => {
    await expect(interpreter.interpret(lib.clickTask.bundle)).resolves.toBeInstanceOf(Object);
  });
});
