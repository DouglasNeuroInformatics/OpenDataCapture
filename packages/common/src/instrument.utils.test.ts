import { describe, expect, it } from 'bun:test';

import { InstrumentTransformer } from '@open-data-capture/instrument-transformer';
import {
  BRIEF_PSYCHIATRIC_RATING_SCALE,
  BRIEF_PSYCHIATRIC_RATING_SCALE_SOURCE,
  ENHANCED_DEMOGRAPHICS_QUESTIONNAIRE,
  ENHANCED_DEMOGRAPHICS_QUESTIONNAIRE_SOURCE,
  HAPPINESS_QUESTIONNAIRE,
  HAPPINESS_QUESTIONNAIRE_SOURCE,
  MINI_MENTAL_STATE_EXAMINATION,
  MINI_MENTAL_STATE_EXAMINATION_SOURCE,
  MONTREAL_COGNITIVE_ASSESSMENT,
  MONTREAL_COGNITIVE_ASSESSMENT_SOURCE
} from '@open-data-capture/instruments';

import { evaluateInstrument } from './instrument.utils';

const transformer = new InstrumentTransformer();

const BPRS_BUNDLE = await transformer.generateBundle(BRIEF_PSYCHIATRIC_RATING_SCALE_SOURCE);
const EDQ_BUNDLE = await transformer.generateBundle(ENHANCED_DEMOGRAPHICS_QUESTIONNAIRE_SOURCE);
const HQ_BUNDLE = await transformer.generateBundle(HAPPINESS_QUESTIONNAIRE_SOURCE);
const MMSE_BUNDLE = await transformer.generateBundle(MINI_MENTAL_STATE_EXAMINATION_SOURCE);
const MOCA_BUNDLE = await transformer.generateBundle(MONTREAL_COGNITIVE_ASSESSMENT_SOURCE);

describe('evaluateInstrument', () => {
  it('should evaluate the brief psychiatric rating scale', () => {
    expect(evaluateInstrument(BPRS_BUNDLE)).resolves.toMatchObject(BRIEF_PSYCHIATRIC_RATING_SCALE);
  });
  it('should evaluate the enhanced demographics questionnaire', () => {
    expect(evaluateInstrument(EDQ_BUNDLE)).resolves.toMatchObject(ENHANCED_DEMOGRAPHICS_QUESTIONNAIRE);
  });
  it('should evaluate the happiness questionnaire', () => {
    expect(evaluateInstrument(HQ_BUNDLE)).resolves.toMatchObject(HAPPINESS_QUESTIONNAIRE);
  });
  it('should evaluate the mini mental state examination', () => {
    expect(evaluateInstrument(MMSE_BUNDLE)).resolves.toMatchObject(MINI_MENTAL_STATE_EXAMINATION);
  });
  it('should evaluate the montreal cognitive assessment', () => {
    expect(evaluateInstrument(MOCA_BUNDLE)).resolves.toMatchObject(MONTREAL_COGNITIVE_ASSESSMENT);
  });
});
