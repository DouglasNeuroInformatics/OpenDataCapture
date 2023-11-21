import { beforeEach, describe, expect, it } from 'bun:test';

import { type FormInstrument, evaluateInstrument } from '@open-data-capture/common/instrument';
import { InstrumentTransformer } from '@open-data-capture/instrument-transformer';

import { happinessQuestionnaire } from '../raw';

const instrumentTransformer = new InstrumentTransformer();

// TBD: Make this an actual unit test instead of relying on the transformer

describe('evaluateInstrument', () => {
  let instrument: FormInstrument;

  beforeEach(() => {
    const bundle = instrumentTransformer.generateBundleSync(happinessQuestionnaire);
    instrument = evaluateInstrument<FormInstrument>(bundle);
  });

  it('should be defined', () => {
    expect(instrument).toBeDefined();
  });
});
