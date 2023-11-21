import { describe, expect, it } from 'bun:test';

import { type FormInstrument, evaluateInstrument } from '@open-data-capture/common/instrument';
import { InstrumentTransformer } from '@open-data-capture/instrument-transformer';

import { happinessQuestionnaire } from '../raw';

const instrumentTransformer = new InstrumentTransformer();

// TBD: Make this an actual unit test instead of relying on the transformer

describe('evaluateInstrument', () => {
  it('should not throw an error', () => {
    const bundle = instrumentTransformer.generateBundleSync(happinessQuestionnaire);
    const instrument = evaluateInstrument<FormInstrument>(bundle, { validate: true });
    expect(instrument).toBeDefined();
  });
});
