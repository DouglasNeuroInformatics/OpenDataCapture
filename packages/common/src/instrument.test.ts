import { describe, expect, it } from 'bun:test';

import {
  BRIEF_PSYCHIATRIC_RATING_SCALE,
  ENHANCED_DEMOGRAPHICS_QUESTIONNAIRE,
  HAPPINESS_QUESTIONNAIRE,
  MINI_MENTAL_STATE_EXAMINATION,
  MONTREAL_COGNITIVE_ASSESSMENT
} from '@open-data-capture/instruments';

import { $Instrument } from './instrument';

describe('$Instrument', () => {
  it('should parse the brief psychiatric rating scale', () => {
    expect($Instrument.parse(BRIEF_PSYCHIATRIC_RATING_SCALE)).toMatchObject(BRIEF_PSYCHIATRIC_RATING_SCALE);
  });
  it('should parse the enhanced demographics questionnaire', () => {
    expect($Instrument.parse(ENHANCED_DEMOGRAPHICS_QUESTIONNAIRE)).toMatchObject(ENHANCED_DEMOGRAPHICS_QUESTIONNAIRE);
  });
  it('should parse the happiness questionnaire', () => {
    expect($Instrument.parse(HAPPINESS_QUESTIONNAIRE)).toMatchObject(HAPPINESS_QUESTIONNAIRE);
  });
  it('should parse the mini mental state examination', () => {
    expect($Instrument.parse(MINI_MENTAL_STATE_EXAMINATION)).toMatchObject(MINI_MENTAL_STATE_EXAMINATION);
  });
  it('should parse the montreal cognitive assessment', () => {
    expect($Instrument.parse(MONTREAL_COGNITIVE_ASSESSMENT)).toMatchObject(MONTREAL_COGNITIVE_ASSESSMENT);
  });
});
