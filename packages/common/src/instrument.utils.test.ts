import { describe, expect, it } from 'bun:test';

import { InstrumentTransformer } from '@open-data-capture/instrument-transformer';
import {
  BPRS,
  BPRS_SOURCE,
  EDQ,
  EDQ_SOURCE,
  HQ,
  HQ_SOURCE,
  MMSE,
  MMSE_SOURCE,
  MOCA,
  MOCA_SOURCE
} from '@open-data-capture/instruments';

import { evaluateInstrument } from './instrument.utils';

const transformer = new InstrumentTransformer();

const BPRS_BUNDLE = await transformer.generateBundle(BPRS_SOURCE);
const EDQ_BUNDLE = await transformer.generateBundle(EDQ_SOURCE);
const HQ_BUNDLE = await transformer.generateBundle(HQ_SOURCE);
const MMSE_BUNDLE = await transformer.generateBundle(MMSE_SOURCE);
const MOCA_BUNDLE = await transformer.generateBundle(MOCA_SOURCE);

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
