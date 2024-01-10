import { describe, expect, it } from 'bun:test';

import { BPRS, EDQ, HQ, MMSE, MOCA } from '@open-data-capture/instruments';

import { $Instrument } from './instrument';

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
