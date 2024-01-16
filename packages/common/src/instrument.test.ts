import { describe, expect, it } from 'bun:test';

import {
  briefPsychiatricRatingScale,
  enhancedDemographicsQuestionnaire,
  happinessQuestionnaire,
  miniMentalStateExamination,
  montrealCognitiveAssessment
} from '@open-data-capture/instrument-library';

import { $Instrument, evaluateInstrument } from './instrument';

const BPRS = await evaluateInstrument(briefPsychiatricRatingScale.bundle);
const EDQ = await evaluateInstrument(enhancedDemographicsQuestionnaire.bundle);
const HQ = await evaluateInstrument(happinessQuestionnaire.bundle);
const MMSE = await evaluateInstrument(miniMentalStateExamination.bundle);
const MOCA = await evaluateInstrument(montrealCognitiveAssessment.bundle);

describe('$Instrument', () => {
  it('should parse the brief psychiatric rating scale', () => {
    expect($Instrument.parse(BPRS)).toMatchObject(BPRS);
  });
  it('should parse the enhanced demographics questionnaire', () => {
    expect($Instrument.parse(EDQ)).toMatchObject(EDQ);
  });
  it('should parse the happiness questionnaire', () => {
    expect($Instrument.parse(HQ)).toMatchObject(HQ);
  });
  it('should parse the mini mental state examination', () => {
    expect($Instrument.parse(MMSE)).toMatchObject(MMSE);
  });
  it('should parse the montreal cognitive assessment', () => {
    expect($Instrument.parse(MOCA)).toMatchObject(MOCA);
  });
});
