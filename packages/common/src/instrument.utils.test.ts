import { describe, expect, it } from 'bun:test';

import {
  briefPsychiatricRatingScale,
  enhancedDemographicsQuestionnaire,
  happinessQuestionnaire,
  miniMentalStateExamination,
  montrealCognitiveAssessment
} from '@open-data-capture/instrument-library';

import { evaluateInstrument } from './instrument.utils';

const BPRS = await evaluateInstrument(briefPsychiatricRatingScale.bundle);
const EDQ = await evaluateInstrument(enhancedDemographicsQuestionnaire.bundle);
const HQ = await evaluateInstrument(happinessQuestionnaire.bundle);
const MMSE = await evaluateInstrument(miniMentalStateExamination.bundle);
const MOCA = await evaluateInstrument(montrealCognitiveAssessment.bundle);


const BPRS_BUNDLE = briefPsychiatricRatingScale.bundle;
const EDQ_BUNDLE = enhancedDemographicsQuestionnaire.bundle;
const HQ_BUNDLE = happinessQuestionnaire.bundle;
const MMSE_BUNDLE = miniMentalStateExamination.bundle;
const MOCA_BUNDLE = montrealCognitiveAssessment.bundle;

describe('evaluateInstrument', () => {
  it('should evaluate the brief psychiatric rating scale', () => {
    expect(evaluateInstrument(BPRS_BUNDLE)).resolves.toMatchObject(BPRS);
  });
  it('should evaluate the enhanced demographics questionnaire', () => {
    expect(evaluateInstrument(EDQ_BUNDLE)).resolves.toMatchObject(EDQ);
  });
  it('should evaluate the happiness questionnaire', () => {
    expect(evaluateInstrument(HQ_BUNDLE)).resolves.toMatchObject(HQ);
  });
  it('should evaluate the mini mental state examination', () => {
    expect(evaluateInstrument(MMSE_BUNDLE)).resolves.toMatchObject(MMSE);
  });
  it('should evaluate the montreal cognitive assessment', () => {
    expect(evaluateInstrument(MOCA_BUNDLE)).resolves.toMatchObject(MOCA);
  });
});
