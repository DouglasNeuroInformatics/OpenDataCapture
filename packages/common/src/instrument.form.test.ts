import { describe, expect, it } from 'bun:test';

import { BPRS, EDQ, HQ, MMSE, MOCA } from '@open-data-capture/instrument-library';

import { $FormInstrument } from './instrument.form';

describe('$FormInstrument', () => {
  it('should parse the brief psychiatric rating scale', () => {
    expect($FormInstrument.parse(BPRS)).toMatchObject(BPRS);
  });
  it('should parse the enhanced demographics questionnaire', () => {
    expect($FormInstrument.parse(EDQ)).toMatchObject(EDQ);
  });
  it('should parse the happiness questionnaire', () => {
    expect($FormInstrument.parse(HQ)).toMatchObject(HQ);
  });
  it('should parse the mini mental state examination', () => {
    expect($FormInstrument.parse(MMSE)).toMatchObject(MMSE);
  });
  it('should parse the montreal cognitive assessment', () => {
    expect($FormInstrument.parse(MOCA)).toMatchObject(MOCA);
  });
});
