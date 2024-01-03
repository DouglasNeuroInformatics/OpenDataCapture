import { beforeAll, describe, expect, it } from 'bun:test';

import { importInstrumentSource } from '@open-data-capture/instruments/macros' with { type: 'macro' };

import { InstrumentTransformer } from '.';

const HQ_SOURCE = importInstrumentSource('forms/happiness-questionnaire');

describe('InstrumentTransformer', () => {
  let transformer: InstrumentTransformer;

  beforeAll(() => {
    transformer = new InstrumentTransformer();
  });

  it('should successfully transpile the happiness questionnaire', async () => {
    const bundle = await transformer.generateBundle(HQ_SOURCE);
    expect(bundle).toBeDefined();
  });
});
